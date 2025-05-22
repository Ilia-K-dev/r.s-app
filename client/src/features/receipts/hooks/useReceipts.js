import { useGetReceiptsQuery, useUploadReceiptMutation } from '../../../shared/services/receiptApi';

export const useReceipts = (page = 1, limit = 20) => {
  const { data, isLoading, error } = useGetReceiptsQuery({ page, limit });
  const [uploadReceipt, { isLoading: isUploading }] = useUploadReceiptMutation();
  
  return {
    receipts: data?.receipts || [],
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    uploadReceipt,
    isUploading,
  };
};
