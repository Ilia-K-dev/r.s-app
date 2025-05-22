"use client";

// Last Modified: 5/9/2025, 10:51:09 PM
// Note: Using Redux state for loading and error handling in ReceiptList.

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setReceipts, setLoading, setError } from '@/store/receiptsSlice';
import { RootState } from '@/store';

interface Receipt {
  id: string;
  description: string;
  amount: number;
  date: string;
}

import receiptsService from '@/services/receipts'; // Assuming services directory is at the root

const ReceiptList: React.FC = () => {
  const dispatch = useDispatch();
  const { receipts, loading, error } = useSelector((state: RootState) => state.receipts);

  useEffect(() => {
    const fetchReceipts = async () => {
      dispatch(setLoading(true)); // Set loading to true
      dispatch(setError(null)); // Clear previous errors
      try {
        const data: Receipt[] = await receiptsService.getAllReceipts();
        dispatch(setReceipts(data)); // Dispatch action to update Redux store
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        dispatch(setError(err.message)); // Set error message
      } finally {
        dispatch(setLoading(false)); // Set loading to false
      }
    };

    fetchReceipts();
  }, [dispatch]); // Add dispatch to dependency array

  if (loading) {
    return <div>Loading Receipts...</div>;
  }

  if (error) {
    return <div>Error loading receipts: {error}</div>; // Use error message from Redux store
  }

  return (
    <div>
      <h2>Receipt List</h2>
      {/* Add receipt list display here */}
      {receipts.length > 0 ? (
        <ul>
          {receipts.map((receipt: Receipt) => (
            <li key={receipt.id}>{receipt.description} - ${receipt.amount}</li> // Use receipt properties from Redux store
          ))}
        </ul>
      ) : (
        <p>No receipts found.</p>
      )}
    </div>
  );
};

export default ReceiptList;
