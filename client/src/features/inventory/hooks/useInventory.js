import { useState, useEffect } from 'react';//correct
import { db } from '../../../core/config/firebase';//correct

export const useInventory = (userId) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('inventory')
      .where('userId', '==', userId)
      .onSnapshot(
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setInventory(items);
          setLoading(false);
        },
        (error) => {
          setError('Error fetching inventory: ' + error.message);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [userId]);

  return {
    inventory,
    loading,
    error
  };
};