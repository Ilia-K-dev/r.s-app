import { useState, useEffect } from 'react';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { db } from '../../../core/config/firebase';//correct
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';//correct

export const useReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchReceipts = async (filters = {}) => {
    try {
      setLoading(true);
      const receiptsRef = collection(db, 'receipts');
      let q = query(
        receiptsRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      if (filters.startDate) {
        q = query(q, where('date', '>=', filters.startDate));
      }
      if (filters.endDate) {
        q = query(q, where('date', '<=', filters.endDate));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      const snapshot = await getDocs(q);
      const receiptData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReceipts(receiptData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addReceipt = async (receiptData) => {
    try {
      const receiptsRef = collection(db, 'receipts');
      const newReceipt = {
        ...receiptData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(receiptsRef, newReceipt);
      return { id: docRef.id, ...newReceipt };
    } catch (err) {
      throw new Error('Failed to add receipt');
    }
  };

  const updateReceipt = async (id, receiptData) => {
    try {
      const receiptRef = doc(db, 'receipts', id);
      await updateDoc(receiptRef, {
        ...receiptData,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update receipt');
    }
  };

  const deleteReceipt = async (id) => {
    try {
      const receiptRef = doc(db, 'receipts', id);
      await deleteDoc(receiptRef);
    } catch (err) {
      throw new Error('Failed to delete receipt');
    }
  };

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    addReceipt,
    updateReceipt,
    deleteReceipt
  };
};
