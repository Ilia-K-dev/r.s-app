import { openDB } from 'idb';

class OfflineSyncManager {
  constructor() {
    this.dbName = 'receiptScannerOffline';
    this.version = 1;
  }
  
  async initDB() {
    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('receipts')) {
          db.createObjectStore('receipts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  
  async saveOfflineReceipt(receipt) {
    await this.db.put('receipts', { ...receipt, syncStatus: 'pending' });
    await this.db.add('pendingActions', {
      type: 'CREATE_RECEIPT',
      data: receipt,
      timestamp: Date.now(),
    });
  }
  
  async syncPendingActions() {
    const actions = await this.db.getAll('pendingActions');
    
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'CREATE_RECEIPT':
            // Assuming createReceipt, updateReceipt, deleteReceipt functions exist and handle online sync
            await createReceipt(action.data);
            break;
          case 'UPDATE_RECEIPT':
            await updateReceipt(action.data.id, action.data);
            break;
          case 'DELETE_RECEIPT':
            await deleteReceipt(action.data.id);
            break;
        }
        
        await this.db.delete('pendingActions', action.id);
      } catch (error) {
        console.error('Sync failed for action:', action, error);
      }
    }
  }
}

export const syncManager = new OfflineSyncManager();
