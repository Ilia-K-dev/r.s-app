import { db } from '../../../core/config/firebase';//correct
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';//correct

export const inventoryService = {
  async getInventory(userId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef, 
        where('userId', '==', userId),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error('Failed to fetch inventory');
    }
  },

  async addItem(userId, itemData) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const newItem = {
        ...itemData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(inventoryRef, newItem);
      return {
        id: docRef.id,
        ...newItem
      };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw new Error('Failed to add inventory item');
    }
  },

  async updateItem(itemId, updateData) {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(itemRef, updates);
      return {
        id: itemId,
        ...updates
      };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error('Failed to update inventory item');
    }
  },

  async deleteItem(itemId) {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      await deleteDoc(itemRef);
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error('Failed to delete inventory item');
    }
  },

  async updateStock(itemId, quantity) {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      await updateDoc(itemRef, {
        quantity,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error('Failed to update stock');
    }
  },

  async checkLowStock(userId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('userId', '==', userId),
        where('quantity', '<=', 0) // Adjust based on your stock logic
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error checking low stock:', error);
      throw new Error('Failed to check low stock');
    }
  }
};
