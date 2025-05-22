import api from '@/utils/api';

// Define types for receipt data here

// Last Modified: 5/10/2025, 1:10:05 AM
// Note: Fixed duplicate declaration of receiptsService.
// Last Modified: 5/10/2025, 1:09:46 AM
// Note: Implemented actual API call to fetch receipts from the backend.

const receiptsService = {
  // Add functions for receipt-related API calls here (e.g., getAllReceipts, getReceiptById, createReceipt)
  getAllReceipts: async () => {
    const response = await api.get('/receipts');
    return response.data; // Return the data from the API response
  },
};

export default receiptsService;
