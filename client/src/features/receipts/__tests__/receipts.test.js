import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
} from 'firebase/firestore'; // Assuming direct import from firebase/firestore

import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL // Assuming getDownloadURL is used
} from 'firebase/storage'; // Assuming direct import from firebase/storage

import {
  isFeatureEnabled,
  startPerformanceTimer,
  stopPerformanceTimer
} from '@/core/config/featureFlags'; // Assuming direct import from featureFlags

import {
  handleError,
  handleFirebaseError
} from '@/utils/errorHandler'; // Assuming direct import from errorHandler

// Assuming API functions are imported from a separate module
import {
  getReceiptsApi,
  getReceiptByIdApi,
  createReceiptApi,
  updateReceiptApi,
  deleteReceiptApi,
  correctReceiptApi,
} from '@/services/api/receipts'; // Assuming API functions are in this path

import receiptsService from '../services/receipts'; // Assuming the service is imported like this

// Mock the necessary modules
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('@/core/config/featureFlags');
jest.mock('@/utils/errorHandler');
jest.mock('@/services/api/receipts'); // Mock the API functions
jest.mock('axios'); // Mock axios if used directly in the service

describe('Receipts Service Unit Tests', () => {
  const mockUserId = 'test-user-id';
  const mockReceiptId = 'test-receipt-id';
  const mockReceiptData = { field: 'value' };
  const mockImageFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
  const mockUpdateData = { field: 'new value' };
  const mockCorrectedData = { correctedField: 'new value' };
  const mockError = new Error('Firestore error');
  const mockApiError = new Error('API error');

  // Mock the return values of chained Firestore methods
  const mockDocSnapshot = {
    exists: jest.fn(),
    data: jest.fn(),
    id: mockReceiptId,
  };

  const mockQuerySnapshot = {
    docs: [],
    empty: true,
    size: 0,
    forEach: jest.fn(),
  };

  const mockDocRef = {
    get: jest.fn(() => Promise.resolve(mockDocSnapshot)),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    collection: jest.fn(),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    where: jest.fn(() => mockCollectionRef),
    orderBy: jest.fn(() => mockCollectionRef),
    limit: jest.fn(() => mockCollectionRef),
    startAfter: jest.fn(() => mockCollectionRef),
    get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    add: jest.fn(() => Promise.resolve(mockDocRef)),
  };

  // Mock the return values of chained Storage methods
  const mockStorageRef = {
    put: jest.fn(),
    child: jest.fn(() => mockStorageRef),
    delete: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test-image.jpg')),
  };


  beforeEach(() => {
    // Clear mocks before each test
    collection.mockClear();
    doc.mockClear();
    addDoc.mockClear();
    updateDoc.mockClear();
    deleteDoc.mockClear();
    query.mockClear();
    where.mockClear();
    orderBy.mockClear();
    getDocs.mockClear();
    getDoc.mockClear();
    ref.mockClear();
    uploadBytes.mockClear();
    deleteObject.mockClear();
    if (getDownloadURL) getDownloadURL.mockClear(); // Clear if imported
    isFeatureEnabled.mockClear();
    startPerformanceTimer.mockClear();
    stopPerformanceTimer.mockClear();
    handleError.mockClear();
    handleFirebaseError.mockClear();
    getReceiptsApi.mockClear();
    getReceiptByIdApi.mockClear();
    createReceiptApi.mockClear();
    updateReceiptApi.mockClear();
    deleteReceiptApi.mockClear();
    correctReceiptApi.mockClear();
    // Clear axios mocks if needed
    // axios.get.mockClear();
    // axios.post.mockClear();
    // axios.put.mockClear();
    // axios.delete.mockClear();


    // Reset mock implementations for chained methods if needed
    mockCollectionRef.doc.mockClear();
    mockCollectionRef.where.mockClear();
    mockCollectionRef.orderBy.mockClear();
    mockCollectionRef.limit.mockClear();
    mockCollectionRef.startAfter.mockClear();
    mockCollectionRef.get.mockClear();
    mockCollectionRef.add.mockClear();
    mockDocRef.get.mockClear();
    mockDocRef.set.mockClear();
    mockDocRef.update.mockClear();
    mockDocRef.delete.mockClear();
    mockDocRef.collection.mockClear();
    mockStorageRef.put.mockClear();
    mockStorageRef.child.mockClear();
    mockStorageRef.delete.mockClear();
    mockStorageRef.getDownloadURL.mockClear();


    // Mock the top-level Firestore functions
    collection.mockReturnValue(mockCollectionRef);
    doc.mockReturnValue(mockDocRef);
    query.mockReturnValue(mockCollectionRef);
    where.mockReturnValue(mockCollectionRef);
    orderBy.mockReturnValue(mockCollectionRef);
    getDocs.mockResolvedValue(mockQuerySnapshot); // Default to empty results
    getDoc.mockResolvedValue(mockDocSnapshot); // Default to mock doc snapshot
    addDoc.mockResolvedValue({ id: 'new-receipt-id' });
    updateDoc.mockResolvedValue(undefined);
    deleteDoc.mockResolvedValue(undefined);


    // Mock the top-level Storage functions
    ref.mockReturnValue(mockStorageRef);
    uploadBytes.mockResolvedValue({ ref: mockStorageRef }); // Mock upload success
    deleteObject.mockResolvedValue(undefined); // Mock delete success
    if (getDownloadURL) getDownloadURL.mockResolvedValue('https://example.com/test-image.jpg'); // Mock getDownloadURL success


    // Mock API function return values
    getReceiptsApi.mockResolvedValue({ receipts: [], lastVisible: null });
    getReceiptByIdApi.mockResolvedValue({ id: 'api-id' });
    createReceiptApi.mockResolvedValue({ id: 'api-id' });
    updateReceiptApi.mockResolvedValue(undefined);
    deleteReceiptApi.mockResolvedValue(undefined);
    correctReceiptApi.mockResolvedValue(undefined);


    // Set default feature flag state
    isFeatureEnabled.mockReturnValue(true); // Assume Firebase direct integration is enabled by default
  });

  // Add your test cases here based on the original file's tests
  // Example test cases based on the error messages and common receipts flows:

  it('getReceipts should fetch receipts from Firestore when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockReceipts = [{ id: 'r1' }, { id: 'r2' }];
    const mockLastVisible = { id: 'r2' };
    const mockQuerySnapshotWithData = {
      docs: mockReceipts.map(data => ({ id: data.id, data: () => data })),
      empty: false,
      size: 2,
      forEach: jest.fn(callback => mockReceipts.forEach(callback)),
      docs: [{ id: 'r1', data: () => mockReceipts[0] }, { id: 'r2', data: () => mockReceipts[1] }],
    };
    mockQuerySnapshotWithData.docs[1].data = () => mockReceipts[1]; // Ensure data function exists
    mockQuerySnapshotWithData.docs[1].id = 'r2'; // Ensure id exists
    mockQuerySnapshotWithData.docs[1].exists = true; // Ensure exists exists

    getDocs.mockResolvedValue(mockQuerySnapshotWithData);

    const result = await receiptsService.getReceipts(mockUserId, {});

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'receipts');
    expect(query).toHaveBeenCalledWith(mockCollectionRef, where('userId', '==', mockUserId), orderBy('date', 'desc'));
    expect(getDocs).toHaveBeenCalledWith(mockCollectionRef);
    expect(result.receipts).toEqual(mockReceipts);
    // expect(result.lastVisible).toEqual(mockLastVisible); // Check lastVisible if implemented
    expect(getReceiptsApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('getReceipts should fallback to API when Firebase fetch fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    getDocs.mockRejectedValue(mockError);
    getReceiptsApi.mockResolvedValue({ receipts: [{ id: 'api-r1' }], lastVisible: null });
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.getReceipts(mockUserId, {});

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'receipts');
    expect(query).toHaveBeenCalledWith(mockCollectionRef, where('userId', '==', mockUserId), orderBy('date', 'desc'));
    expect(getDocs).toHaveBeenCalledWith(mockCollectionRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - getReceipts');
    expect(getReceiptsApi).toHaveBeenCalledWith(mockUserId, {});
    expect(result).toEqual({ receipts: [{ id: 'api-r1' }], lastVisible: null });
  });

  it('getReceipts should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    getReceiptsApi.mockResolvedValue({ receipts: [{ id: 'api-r1' }], lastVisible: null });

    const result = await receiptsService.getReceipts(mockUserId, {});

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getDocs).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getReceiptsApi).toHaveBeenCalledWith(mockUserId, {});
    expect(result).toEqual({ receipts: [{ id: 'api-r1' }], lastVisible: null });
  });

  it('getReceiptById should fetch receipt from Firestore when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockReceipt = { id: mockReceiptId, userId: mockUserId, data: 'mock data' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);

    const result = await receiptsService.getReceiptById(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(result).toEqual(mockReceipt);
    expect(getReceiptByIdApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('getReceiptById should return null if receipt not found or not owned when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    mockDocSnapshot.exists.mockReturnValue(false); // Receipt not found
    getDoc.mockResolvedValue(mockDocSnapshot);

    const result = await receiptsService.getReceiptById(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(result).toBeNull();
    expect(getReceiptByIdApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('getReceiptById should fallback to API when Firebase fetch fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    getDoc.mockRejectedValue(mockError);
    getReceiptByIdApi.mockResolvedValue({ id: 'api-id' });
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.getReceiptById(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - getReceiptById');
    expect(getReceiptByIdApi).toHaveBeenCalledWith(mockUserId, mockReceiptId);
    expect(result).toEqual({ id: 'api-id' });
  });

  it('getReceiptById should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    getReceiptByIdApi.mockResolvedValue({ id: 'api-id' });

    const result = await receiptsService.getReceiptById(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getDoc).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getReceiptByIdApi).toHaveBeenCalledWith(mockUserId, mockReceiptId);
    expect(result).toEqual({ id: 'api-id' });
  });

  it('createReceipt should add document to Firestore and upload image to Storage when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const expectedReceiptData = { ...mockReceiptData, userId: mockUserId, createdAt: expect.any(Date) };
    addDoc.mockResolvedValue({ id: 'new-receipt-id' });
    uploadBytes.mockResolvedValue({ ref: mockStorageRef });
    getDownloadURL.mockResolvedValue('https://example.com/new-image.jpg');

    const result = await receiptsService.createReceipt(mockUserId, mockReceiptData, mockImageFile);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'receipts');
    expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, { ...expectedReceiptData, imageUrl: 'https://example.com/new-image.jpg' });
    expect(ref).toHaveBeenCalledWith(expect.any(Object), `receipt_images/${mockUserId}/${expect.any(String)}`);
    expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, mockImageFile);
    expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
    expect(result).toEqual({ id: 'new-receipt-id' });
    expect(createReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('createReceipt should add document to Firestore without image when no imageFile is provided and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const expectedReceiptData = { ...mockReceiptData, userId: mockUserId, createdAt: expect.any(Date) };
    addDoc.mockResolvedValue({ id: 'new-receipt-id' });

    const result = await receiptsService.createReceipt(mockUserId, mockReceiptData, null);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'receipts');
    expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, expectedReceiptData);
    expect(ref).not.toHaveBeenCalled(); // Ensure Storage was not called
    expect(uploadBytes).not.toHaveBeenCalled();
    expect(getDownloadURL).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'new-receipt-id' });
    expect(createReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('createReceipt should fallback to API when Firebase creation fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    addDoc.mockRejectedValue(mockError);
    createReceiptApi.mockResolvedValue({ id: 'api-id' });
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.createReceipt(mockUserId, mockReceiptData, mockImageFile);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'receipts');
    expect(addDoc).toHaveBeenCalled();
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - createReceipt');
    expect(createReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptData, mockImageFile);
    expect(result).toEqual({ id: 'api-id' });
  });

  it('createReceipt should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    createReceiptApi.mockResolvedValue({ id: 'api-id' });

    const result = await receiptsService.createReceipt(mockUserId, mockReceiptData, mockImageFile);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(collection).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(addDoc).not.toHaveBeenCalled();
    expect(ref).not.toHaveBeenCalled(); // Ensure Storage was not called
    expect(uploadBytes).not.toHaveBeenCalled();
    expect(getDownloadURL).not.toHaveBeenCalled();
    expect(createReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptData, mockImageFile);
    expect(result).toEqual({ id: 'api-id' });
  });

  it('updateReceipt should update document in Firestore and handle image upload/deletion when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockResolvedValue(undefined);
    deleteObject.mockResolvedValue(undefined);
    uploadBytes.mockResolvedValue({ ref: mockStorageRef });
    getDownloadURL.mockResolvedValue('https://example.com/new-image.jpg');

    const result = await receiptsService.updateReceipt(mockUserId, mockReceiptId, mockUpdateData, mockImageFile);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteObject).toHaveBeenCalled(); // Ensure old image is deleted
    expect(ref).toHaveBeenCalledWith(expect.any(Object), `receipt_images/${mockUserId}/${expect.any(String)}`);
    expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, mockImageFile);
    expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { ...mockUpdateData, imageUrl: 'https://example.com/new-image.jpg' });
    expect(result).toBeUndefined();
    expect(updateReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('updateReceipt should delete image if imageUrl is set to null and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockResolvedValue(undefined);
    deleteObject.mockResolvedValue(undefined);

    const result = await receiptsService.updateReceipt(mockUserId, mockReceiptId, { imageUrl: null }, null);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteObject).toHaveBeenCalled(); // Ensure old image is deleted
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { imageUrl: null });
    expect(result).toBeUndefined();
    expect(updateReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('updateReceipt should not delete image if imageUrl is not changed and no new image is provided and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockResolvedValue(undefined);
    deleteObject.mockResolvedValue(undefined); // Clear mock from previous tests

    const result = await receiptsService.updateReceipt(mockUserId, mockReceiptId, { field: 'new value' }, null);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteObject).not.toHaveBeenCalled(); // Ensure old image is NOT deleted
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { field: 'new value' });
    expect(result).toBeUndefined();
    expect(updateReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('updateReceipt should throw error if receipt not found or not owned when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    mockDocSnapshot.exists.mockReturnValue(false); // Receipt not found
    getDoc.mockResolvedValue(mockDocSnapshot);
    handleFirebaseError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(receiptsService.updateReceipt(mockUserId, mockReceiptId, mockUpdateData, null)).rejects.toThrow('Receipt not found or unauthorized');

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(expect.any(Error), 'Receipt Service - updateReceipt');
    expect(updateDoc).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
    expect(uploadBytes).not.toHaveBeenCalled();
    expect(updateReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('updateReceipt should fallback to API when Firebase update fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockRejectedValue(mockError);
    updateReceiptApi.mockResolvedValue(undefined);
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.updateReceipt(mockUserId, mockReceiptId, mockUpdateData, null);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, mockUpdateData);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - updateReceipt');
    expect(updateReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId, mockUpdateData, null);
    expect(result).toBeUndefined();
  });

  it('updateReceipt should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    updateReceiptApi.mockResolvedValue(undefined);

    const result = await receiptsService.updateReceipt(mockUserId, mockReceiptId, mockUpdateData, mockImageFile);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
    expect(uploadBytes).not.toHaveBeenCalled();
    expect(updateReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId, mockUpdateData, mockImageFile);
    expect(result).toBeUndefined();
  });

  it('deleteReceipt should delete document from Firestore and image from Storage when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    deleteDoc.mockResolvedValue(undefined);
    deleteObject.mockResolvedValue(undefined);

    const result = await receiptsService.deleteReceipt(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteObject).toHaveBeenCalled(); // Ensure image is deleted
    expect(result).toBeUndefined();
    expect(deleteReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('deleteReceipt should delete document from Firestore without deleting image if no imageUrl and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: null };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    deleteDoc.mockResolvedValue(undefined);
    deleteObject.mockResolvedValue(undefined); // Clear mock from previous tests

    const result = await receiptsService.deleteReceipt(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteObject).not.toHaveBeenCalled(); // Ensure image is NOT deleted
    expect(result).toBeUndefined();
    expect(deleteReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('deleteReceipt should throw error if receipt not found or not owned when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    mockDocSnapshot.exists.mockReturnValue(false); // Receipt not found
    getDoc.mockResolvedValue(mockDocSnapshot);
    handleFirebaseError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(receiptsService.deleteReceipt(mockUserId, mockReceiptId)).rejects.toThrow('Receipt not found or unauthorized');

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(expect.any(Error), 'Receipt Service - deleteReceipt');
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
    expect(deleteReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('deleteReceipt should fallback to API when Firebase deletion fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, imageUrl: 'https://example.com/old-image.jpg' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    deleteDoc.mockRejectedValue(mockError);
    deleteReceiptApi.mockResolvedValue(undefined);
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.deleteReceipt(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - deleteReceipt');
    expect(deleteReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId);
    expect(result).toBeUndefined();
  });

  it('deleteReceipt should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    deleteReceiptApi.mockResolvedValue(undefined);

    const result = await receiptsService.deleteReceipt(mockUserId, mockReceiptId);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
    expect(deleteReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId);
    expect(result).toBeUndefined();
  });

  it('correctReceipt should update document in Firestore when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, data: 'old data' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockResolvedValue(undefined);

    const result = await receiptsService.correctReceipt(mockUserId, mockReceiptId, mockCorrectedData);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, mockCorrectedData);
    expect(result).toBeUndefined();
    expect(correctReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });

  it('correctReceipt should throw error if receipt not found or not owned when feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    mockDocSnapshot.exists.mockReturnValue(false); // Receipt not found
    getDoc.mockResolvedValue(mockDocSnapshot);
    handleFirebaseError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(receiptsService.correctReceipt(mockUserId, mockReceiptId, mockCorrectedData)).rejects.toThrow('Receipt not found or unauthorized');

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(handleFirebaseError).toHaveBeenCalledWith(expect.any(Error), 'Receipt Service - correctReceipt');
    expect(updateDoc).not.toHaveBeenCalled();
    expect(correctReceiptApi).not.toHaveBeenCalled(); // Ensure API was not called
  });


  it('correctReceipt should fallback to API when Firebase update fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    const mockExistingReceipt = { id: mockReceiptId, userId: mockUserId, data: 'old data' };
    mockDocSnapshot.exists.mockReturnValue(true);
    mockDocSnapshot.data.mockReturnValue(mockExistingReceipt);
    getDoc.mockResolvedValue(mockDocSnapshot);
    updateDoc.mockRejectedValue(mockError);
    correctReceiptApi.mockResolvedValue(undefined);
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error

    const result = await receiptsService.correctReceipt(mockUserId, mockReceiptId, mockCorrectedData);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'receipts', mockReceiptId);
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, mockCorrectedData);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Receipt Service - correctReceipt');
    expect(correctReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId, mockCorrectedData);
    expect(result).toBeUndefined();
  });

  it('correctReceipt should call API when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    correctReceiptApi.mockResolvedValue(undefined);

    const result = await receiptsService.correctReceipt(mockUserId, mockReceiptId, mockCorrectedData);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(doc).not.toHaveBeenCalled(); // Ensure Firebase was not called
    expect(getDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(correctReceiptApi).toHaveBeenCalledWith(mockUserId, mockReceiptId, mockCorrectedData);
    expect(result).toBeUndefined();
  });
});
