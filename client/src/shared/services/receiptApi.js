export const useGetReceiptsQuery = ({ page, limit }) => {
  return {
    data: { receipts: [], totalCount: 0 },
    isLoading: false,
    error: null
  };
};

export const useUploadReceiptMutation = () => {
  return [() => Promise.resolve({ data: {} }), { isLoading: false, error: null }];
};
