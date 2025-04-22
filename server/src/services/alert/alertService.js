const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { sendNotification } = require('../../services/notification/NotificationService'); //good

class AlertService {
  constructor() {
    this.alertTypes = {
      LOW_STOCK: {
        priority: 'high',
        category: 'inventory',
        autoResolve: false
      },
      STOCK_OUT: {
        priority: 'critical',
        category: 'inventory',
        autoResolve: false
      },
      REORDER_POINT: {
        priority: 'medium',
        category: 'inventory',
        autoResolve: true
      },
      PRICE_CHANGE: {
        priority: 'medium',
        category: 'pricing',
        autoResolve: true
      },
      EXPIRY_WARNING: {
        priority: 'high',
        category: 'quality',
        autoResolve: false
      },
      STOCK_DISCREPANCY: {
        priority: 'high',
        category: 'inventory',
        autoResolve: false
      }
    };
  }

  async createAlert(data) {
    try {
      const alertType = this.alertTypes[data.type];
      if (!alertType) {
        throw new Error('Invalid alert type');
      }

      const alert = {
        ...data,
        priority: data.priority || alertType.priority,
        category: alertType.category,
        status: 'active',
        createdAt: new Date(),
        notifications: [],
        escalations: [],
        autoResolve: alertType.autoResolve,
        resolvedAt: null,
        resolvedBy: null
      };

      // Save alert
      const alertRef = await db.collection('alerts').add(alert);
      alert.id = alertRef.id;

      // Process alert based on priority
      await this._processAlert(alert);

      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  async _processAlert(alert) {
    try {
      // Get notification preferences
      const preferences = await this._getNotificationPreferences(alert.userId);

      // Send notifications based on priority and preferences
      const notifications = [];

      if (preferences.email && (alert.priority === 'high' || alert.priority === 'critical')) {
        const emailNotification = await this._sendEmailAlert(alert, preferences.email);
        notifications.push(emailNotification);
      }

      if (preferences.push) {
        const pushNotification = await this._sendPushAlert(alert);
        notifications.push(pushNotification);
      }

      if (alert.priority === 'critical') {
        const smsNotification = await this._sendSMSAlert(alert, preferences.phone);
        notifications.push(smsNotification);
      }

      // Update alert with notification records
      await db.collection('alerts').doc(alert.id).update({
        notifications,
        lastNotified: new Date()
      });

      // Set up auto-escalation for unresolved critical alerts
      if (alert.priority === 'critical') {
        await this._setupEscalation(alert);
      }
    } catch (error) {
      logger.error('Error processing alert:', error);
      throw error;
    }
  }

  async resolveAlert(alertId, userId, resolution) {
    try {
      const alertRef = db.collection('alerts').doc(alertId);
      const alert = await alertRef.get();

      if (!alert.exists) {
        throw new Error('Alert not found');
      }

      const resolutionData = {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolution
      };

      await alertRef.update(resolutionData);

      // Log resolution
      await this._logAlertResolution(alertId, resolutionData);

      return {
        id: alertId,
        ...alert.data(),
        ...resolutionData
      };
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw error;
    }
  }

  async getActiveAlerts(userId, filters = {}) {
    try {
      let query = db.collection('alerts')
        .where('userId', '==', userId)
        .where('status', '==', 'active');

      if (filters.priority) {
        query = query.where('priority', '==', filters.priority);
      }
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      throw error;
    }
  }

  async _setupEscalation(alert) {
    try {
      const escalationLevels = await this._getEscalationLevels(alert.category);
      let currentLevel = 0;

      const escalation = setInterval(async () => {
        // Check if alert is still active
        const currentAlert = await db.collection('alerts').doc(alert.id).get();
        if (currentAlert.data().status !== 'active') {
          clearInterval(escalation);
          return;
        }

        // Escalate to next level
        if (currentLevel < escalationLevels.length) {
          await this._escalateAlert(alert, escalationLevels[currentLevel]);
          currentLevel++;
        } else {
          clearInterval(escalation);
        }
      }, 30 * 60 * 1000); // Check every 30 minutes

      // Store escalation reference
      alert.escalationId = escalation;
    } catch (error) {
      logger.error('Error setting up escalation:', error);
      throw error;
    }
  }

  async _escalateAlert(alert, escalationLevel) {
    try {
      const escalation = {
        alertId: alert.id,
        level: escalationLevel.level,
        timestamp: new Date(),
        notifiedUsers: [],
        status: 'pending'
      };

      // Notify escalation contacts
      for (const contact of escalationLevel.contacts) {
        await this._sendEscalationNotification(alert, contact);
        escalation.notifiedUsers.push(contact);
      }

      // Update alert with escalation record
      await db.collection('alerts').doc(alert.id).update({
        escalations: admin.firestore.FieldValue.arrayUnion(escalation)
      });

      return escalation;
    } catch (error) {
      logger.error('Error escalating alert:', error);
      throw error;
    }
  }

  async _sendEmailAlert(alert, email) {
    // Implementation for sending email alerts
    const emailContent = this._generateAlertEmailContent(alert);
    return await sendEmail(email, emailContent);
  }

  async _sendPushAlert(alert) {
    // Implementation for sending push notifications
    const pushContent = this._generateAlertPushContent(alert);
    return await sendPushNotification(alert.userId, pushContent);
  }

  async _sendSMSAlert(alert, phone) {
    // Implementation for sending SMS alerts
    const smsContent = this._generateAlertSMSContent(alert);
    return await sendSMS(phone, smsContent);
  }

  _generateAlertEmailContent(alert) {
    // Generate email content based on alert type and data
    const templates = {
      LOW_STOCK: {
        subject: 'Low Stock Alert',
        template: 'low-stock-email'
      },
      STOCK_OUT: {
        subject: 'Stock Out Alert',
        template: 'stock-out-email'
      }
      // ... other templates
    };

    return templates[alert.type];
  }
}

module.exports = new AlertService();