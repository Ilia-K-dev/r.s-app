import { db } from '../../../core/config/firebase'; //correct

export const getUserSettings = async userId => {
  try {
    const settingsDoc = await db.collection('settings').doc(userId).get();
    if (settingsDoc.exists) {
      return settingsDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Failed to get user settings');
  }
};

export const updateUserSettings = async (userId, settings) => {
  try {
    await db.collection('settings').doc(userId).set(settings, { merge: true });
  } catch (error) {
    throw new Error('Failed to update user settings');
  }
};
