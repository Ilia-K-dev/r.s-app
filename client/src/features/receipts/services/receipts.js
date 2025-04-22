import { db, storage } from '../../../core/config/firebase';//correct
import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  startAfter,
  limit
} from 'firebase/firestore';//correct
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';//correct

const COLLECTION_NAME = 'receipts';
const RECEIPTS_PER_PAGE = 10;

export const receiptApi = {
  // Create new receipt
  createReceipt: async (receiptData, imageFile = null) => {
    try {
      let imageUrl = null;
      if (imageFile) {
        const storageRef = ref(storage, `receipts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...receiptData,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        id: docRef.id,
        ...receiptData,
        imageUrl
      };
    } catch (error) {
      throw new Error('Failed to create receipt: ' + error.message);
    }
  },

  // Get receipts with pagination and filters
  getReceipts: async ({ 
    userId,
    startDate = null,
    endDate = null,
    category = null,
    page = 1,
    lastDoc = null
  }) => {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (startDate) {
        q = query(q, where('date', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('date', '<=', endDate));
      }
      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(RECEIPTS_PER_PAGE));

      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      
      const receipts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        receipts,
        lastDoc: lastVisible,
        hasMore: receipts.length === RECEIPTS_PER_PAGE
      };
    } catch (error) {
      throw new Error('Failed to fetch receipts: ' + error.message);
    }
  },

  // Get single receipt by ID
  getReceiptById: async (receiptId) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, receiptId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Receipt not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      throw new Error('Failed to fetch receipt: ' + error.message);
    }
  },

  // Update receipt
  updateReceipt: async (receiptId, updateData, newImageFile = null) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, receiptId);
      const receipt = await getDoc(docRef);

      if (!receipt.exists()) {
        throw new Error('Receipt not found');
      }

      let imageUrl = updateData.imageUrl;

      // Handle image update
      if (newImageFile) {
        // Delete old image if exists
        if (receipt.data().imageUrl) {
          const oldImageRef = ref(storage, receipt.data().imageUrl);
          try {
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn('Failed to delete old image:', error);
          }
        }

        // Upload new image
        const storageRef = ref(storage, `receipts/${Date.now()}_${newImageFile.name}`);
        await uploadBytes(storageRef, newImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updates = {
        ...updateData,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updates);

      return {
        id: receiptId,
        ...updates
      };
    } catch (error) {
      throw new Error('Failed to update receipt: ' + error.message);
    }
  },

  // Delete receipt
  deleteReceipt: async (receiptId) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, receiptId);
      const receipt = await getDoc(docRef);

      if (!receipt.exists()) {
        throw new Error('Receipt not found');
      }

      // Delete image if exists
      if (receipt.data().imageUrl) {
        const imageRef = ref(storage, receipt.data().imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Failed to delete image:', error);
        }
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      throw new Error('Failed to delete receipt: ' + error.message);
    }
  }
};

export default receiptApi;