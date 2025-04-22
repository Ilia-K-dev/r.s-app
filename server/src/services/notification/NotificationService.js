const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');

// Configure SendGrid
let sgMail;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } else {
    logger.warn('SendGrid API key not found in environment variables');
  }
} catch (error) {
  logger.warn('SendGrid package not installed. Email notifications will be disabled.');
}

// Configure Firebase Admin (FCM)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../../../config/firebase-service-account.json')),
  });
}

class NotificationService {
  constructor() {
    this.notificationsCollection = db.collection('notifications');
    this.preferencesCollection = db.collection('notificationPreferences');
    
    this.notificationTypes = {
      STOCK_ALERT: 'stock_alert',
      PRICE_CHANGE: 'price_change',
      REORDER: 'reorder_point',
      EXPIRY: 'expiry_warning',
      SYSTEM: 'system_notification'
    };

    this.priorities = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  async sendNotification(userId, notification) {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Check if user wants this type of notification
      if (!this._shouldSendNotification(notification, preferences)) {
        logger.info('Notification skipped based on user preferences');
        return null;
      }

      const notificationData = {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority || this.priorities.MEDIUM,
        metadata: notification.metadata || {},
        status: 'unread',
        createdAt: new Date(),
        scheduledFor: notification.scheduledFor || new Date(),
        channels: this._determineChannels(notification, preferences),
        read: false,
        readAt: null
      };

      // Save notification
      const docRef = await this.notificationsCollection.add(notificationData);

      // Send through selected channels
      await this._sendThroughChannels(docRef.id, notificationData);

      return {
        id: docRef.id,
        ...notificationData
      };
    } catch (error) {
      logger.error('Send notification error:', error);
      throw new AppError('Failed to send notification', 500);
    }
  }

  async _sendEmail(notification) {
    try {
      const emailData = {
        to: notification.userId,
        from: 'iliakatsva@gmail.com',
        subject: notification.title,
        text: notification.message,
        html: `<p>${notification.message}</p>`
      };
      await sgMail.send(emailData);
      logger.info('Email sent successfully', { notificationId: notification.id });
    } catch (error) {
      logger.error('Email sending error:', error);
    }
  }

  async _sendPushNotification(notification) {
    try {
      const pushData = {
        token: notification.userId,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: notification.metadata || {}
      };
      await admin.messaging().send(pushData);
      logger.info('Push notification sent successfully', { notificationId: notification.id });
    } catch (error) {
      logger.error('Push notification error:', error);
    }
  }

  _getDefaultPreferences() {
    return {
      channels: {
        email: true,
        push: true,
        sms: false
      },
      types: {
        [this.notificationTypes.STOCK_ALERT]: true,
        [this.notificationTypes.PRICE_CHANGE]: true,
        [this.notificationTypes.REORDER]: true,
        [this.notificationTypes.EXPIRY]: true,
        [this.notificationTypes.SYSTEM]: true
      },
      priorities: {
        [this.priorities.LOW]: false,
        [this.priorities.MEDIUM]: true,
        [this.priorities.HIGH]: true,
        [this.priorities.CRITICAL]: true
      },
      categories: {
        inventory: true,
        pricing: true,
        quality: true,
        security: true
      },
      thresholds: {
        lowStock: 20,
        criticalStock: 10,
        reorderPoint: 30
      },
      schedules: {
        dailyDigest: true,
        weeklyReport: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateChannelPreference(userId, channel, enabled) {
    try {
      const update = {
        [`channels.${channel}`]: enabled,
        updatedAt: new Date()
      };
      await this.preferencesCollection.doc(userId).update(update);
      return this.getUserPreferences(userId);
    } catch (error) {
      logger.error('Channel preference update error:', error);
      throw new AppError('Failed to update channel preference', 500);
    }
  }

  // ... rest of the existing methods ...

  async getUserPreferences(userId) {
    try {
      const prefDoc = await this.preferencesCollection.doc(userId).get();
      
      if (!prefDoc.exists) {
        // Create default preferences
        const defaultPrefs = this._getDefaultPreferences();
        await this.preferencesCollection.doc(userId).set(defaultPrefs);
        return defaultPrefs;
      }

      return prefDoc.data();
    } catch (error) {
      logger.error('Get preferences error:', error);
      throw new AppError('Failed to get notification preferences', 500);
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        ...preferences,
        updatedAt: new Date()
      };

      await this.preferencesCollection.doc(userId).set(updatedPrefs);
      return updatedPrefs;
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw new AppError('Failed to update preferences', 500);
    }
  }

  async getNotifications(userId, options = {}) {
    try {
      let query = this.notificationsCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');

      if (options.unreadOnly) {
        query = query.where('read', '==', false);
      }
      if (options.type) {
        query = query.where('type', '==', options.type);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Get notifications error:', error);
      throw new AppError('Failed to fetch notifications', 500);
    }
  }

  async markAsRead(userId, notificationId) {
    try {
      const notificationRef = this.notificationsCollection.doc(notificationId);
      const notification = await notificationRef.get();

      if (!notification.exists || notification.data().userId !== userId) {
        throw new AppError('Notification not found', 404);
      }

      await notificationRef.update({
        read: true,
        readAt: new Date()
      });

      return true;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw new AppError('Failed to mark notification as read', 500);
    }
  }
}

module.exports = new NotificationService();