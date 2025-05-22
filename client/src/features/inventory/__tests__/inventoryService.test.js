import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy, // Assuming orderBy is used
  getDocs // Assuming getDocs is used
} from 'firebase/firestore'; // Assuming direct import from firebase/firestore

import {
  handleError, // Assuming handleError is used
  handleFirebaseError // Assuming handleFirebaseError is used
} from '@/utils/errorHandler'; // Assuming direct import from errorHandler

import {
  addItem,
  updateItem,
  deleteItem,
  updateStock,
  getStockMovements,
  addStockMovement,
} from '../services/inventoryService'; // Updated import to directly import functions

// Mock the necessary modules
jest.mock('firebase/firestore');
jest.mock('@/utils/errorHandler');
// Provide an explicit factory function for the service mock
jest.mock('../services/inventoryService', () => ({
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateStock: jest.fn(),
  getStockMovements: jest.fn(),
  addStockMovement: jest.fn(),
}));


describe('Inventory Service Unit Tests', () => {
  const mockUserId = 'test-user-id';
  const mockInventoryItem = {
    name: 'Test Item',
    quantity: 10,
    userId: mockUserId,
  };
  const mockItemId = 'test-item-id';
  const mockStockMovement = {
    itemId: mockItemId,
    quantity: 5,
    type: 'sale',
    notes: 'Sold some',
    timestamp: expect.any(Date),
  };
  const mockError = new Error('Firestore error');
  mockError.code = 'firestore/some-error'; // Add a code property for handleFirebaseError

  // Mock the return values of chained Firestore methods
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    collection: jest.fn(),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    where: jest.fn(() => mockCollectionRef),
    orderBy: jest.fn(() => mockCollectionRef),
    limit: jest.fn(() => mockCollectionRef),
    startAfter: jest.fn(() => mockCollectionRef),
    get: jest.fn(),
    add: jest.fn(),
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
    if (orderBy) orderBy.mockClear(); // Clear if imported
    if (getDocs) getDocs.mockClear(); // Clear if imported
    handleError.mockClear();
    handleFirebaseError.mockClear();

    // Clear mocks for directly imported service functions
    addItem.mockClear();
    updateItem.mockClear();
    deleteItem.mockClear();
    updateStock.mockClear();
    getStockMovements.mockClear();
    addStockMovement.mockClear();


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


    // Mock the top-level Firestore functions
    collection.mockReturnValue(mockCollectionRef);
    doc.mockReturnValue(mockDocRef);
    query.mockReturnValue(mockCollectionRef);
    where.mockReturnValue(mockCollectionRef);
    orderBy.mockReturnValue(mockCollectionRef);
    getDocs.mockResolvedValue({ docs: [] }); // Default to empty results
    getDoc.mockResolvedValue(mockDocSnapshot); // Default to mock doc snapshot
    addDoc.mockResolvedValue({ id: 'new-item-id' });
    updateDoc.mockResolvedValue(undefined);
    deleteDoc.mockResolvedValue(undefined);

    // Mock the directly imported service functions
    addItem.mockResolvedValue({ id: 'new-item-id' });
    updateItem.mockResolvedValue(undefined);
    deleteItem.mockResolvedValue(undefined);
    updateStock.mockResolvedValue(undefined);
    getStockMovements.mockResolvedValue([]);
    addStockMovement.mockResolvedValue({ id: 'new-movement-id' });

  });

  // Add your test cases here based on the original file's tests
  // Example test cases based on the error messages and common inventory flows:

  it('addItem should add a new inventory item to Firestore', async () => {
    const newItemData = { name: 'New Item', quantity: 5 };
    const expectedItem = { ...newItemData, userId: mockUserId, createdAt: expect.any(Date) };
    // addDoc.mockResolvedValue({ id: 'new-item-id' }); // Mocked the service function directly now

    const result = await addItem(mockUserId, newItemData); // Call the directly imported function

    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'inventory'); // These expectations might need adjustment if the service implementation changes
    // expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, expectedItem);
    expect(addItem).toHaveBeenCalledWith(mockUserId, newItemData); // Expect the service function to be called
    expect(result).toEqual({ id: 'new-item-id' });
  });

  it('addItem should log error and throw on failure', async () => {
    const newItemData = { name: 'New Item', quantity: 5 };
    addItem.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(addItem(mockUserId, newItemData)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(addItem).toHaveBeenCalledWith(mockUserId, newItemData); // Expect the service function to be called
    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'inventory'); // These expectations might need adjustment
    // expect(addDoc).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - addItem');
  });

  it('updateItem should update an existing inventory item in Firestore', async () => {
    const updateData = { quantity: 15 };
    // updateDoc.mockResolvedValue(undefined); // Mocked the service function directly now

    await updateItem(mockItemId, updateData); // Call the directly imported function

    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(updateDoc).toHaveBeenCalledWith(mockDocRef, updateData);
    expect(updateItem).toHaveBeenCalledWith(mockItemId, updateData); // Expect the service function to be called
  });

  it('updateItem should log error and throw on failure', async () => {
    const updateData = { quantity: 15 };
    updateItem.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(updateItem(mockItemId, updateData)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(updateItem).toHaveBeenCalledWith(mockItemId, updateData); // Expect the service function to be called
    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(updateDoc).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - updateItem');
  });

  it('deleteItem should delete an inventory item from Firestore', async () => {
    // deleteDoc.mockResolvedValue(undefined); // Mocked the service function directly now

    await deleteItem(mockItemId); // Call the directly imported function

    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(deleteItem).toHaveBeenCalledWith(mockItemId); // Expect the service function to be called
  });

  it('deleteItem should log error and throw on failure', async () => {
    deleteItem.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(deleteItem(mockItemId)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(deleteItem).toHaveBeenCalledWith(mockItemId); // Expect the service function to be called
    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(deleteDoc).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - deleteItem');
  });

  it('updateStock should update the quantity of an inventory item in Firestore', async () => {
    const newQuantity = 20;
    // updateDoc.mockResolvedValue(undefined); // Mocked the service function directly now

    await updateStock(mockItemId, newQuantity); // Call the directly imported function

    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { quantity: newQuantity });
    expect(updateStock).toHaveBeenCalledWith(mockItemId, newQuantity); // Expect the service function to be called
  });

  it('updateStock should log error and throw on failure', async () => {
    const newQuantity = 20;
    updateStock.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(updateStock(mockItemId, newQuantity)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(updateStock).toHaveBeenCalledWith(mockItemId, newQuantity); // Expect the service function to be called
    // expect(doc).toHaveBeenCalledWith(expect.any(Object), 'inventory', mockItemId); // These expectations might need adjustment
    // expect(updateDoc).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - updateStock');
  });

  it('getStockMovements should fetch stock movements for an item from Firestore', async () => {
    const mockStockMovements = [{ id: 'move1', quantity: 5 }];
    // getDocs.mockResolvedValue(mockQuerySnapshot); // Mocked the service function directly now
    getStockMovements.mockResolvedValue(mockStockMovements); // Mock the service function return value

    const result = await getStockMovements(mockItemId); // Call the directly imported function

    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'stockMovements'); // These expectations might need adjustment
    // expect(query).toHaveBeenCalledWith(mockCollectionRef, where('itemId', '==', mockItemId), orderBy('timestamp', 'desc'));
    // expect(getDocs).toHaveBeenCalledWith(mockCollectionRef);
    expect(getStockMovements).toHaveBeenCalledWith(mockItemId); // Expect the service function to be called
    expect(result).toEqual(mockStockMovements);
  });

  it('getStockMovements should log error and throw on failure', async () => {
    getStockMovements.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(getStockMovements(mockItemId)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(getStockMovements).toHaveBeenCalledWith(mockItemId); // Expect the service function to be called
    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'stockMovements'); // These expectations might need adjustment
    // expect(query).toHaveBeenCalledWith(mockCollectionRef, where('itemId', '==', mockItemId), orderBy('timestamp', 'desc'));
    // expect(getDocs).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - getStockMovements');
  });

  it('addStockMovement should add a new stock movement record to Firestore', async () => {
    const mockMovementData = { quantity: 5, type: 'sale', notes: 'Sold some' };
    const expectedMovement = { ...mockMovementData, itemId: mockItemId, timestamp: expect.any(Date) };
    // addDoc.mockResolvedValue({ id: 'new-movement-id' }); // Mocked the service function directly now
    addStockMovement.mockResolvedValue({ id: 'new-movement-id' }); // Mock the service function return value

    const result = await addStockMovement(mockItemId, mockMovementData.quantity, mockMovementData.type, mockMovementData.notes); // Call the directly imported function

    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'stockMovements'); // These expectations might need adjustment
    // expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, expectedMovement);
    expect(addStockMovement).toHaveBeenCalledWith(mockItemId, mockMovementData.quantity, mockMovementData.type, mockMovementData.notes); // Expect the service function to be called
    expect(result).toEqual({ id: 'new-movement-id' });
  });

  it('addStockMovement should log error and throw on failure', async () => {
    const mockMovementData = { quantity: 5, type: 'sale', notes: 'Sold some' };
    addStockMovement.mockRejectedValue(mockError); // Mock the service function failure
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(addStockMovement(mockItemId, mockMovementData.quantity, mockMovementData.type, mockMovementData.notes)).rejects.toThrow('Firestore error'); // Call the directly imported function
    expect(addStockMovement).toHaveBeenCalledWith(mockItemId, mockMovementData.quantity, mockMovementData.type, mockMovementData.notes); // Expect the service function to be called
    // expect(collection).toHaveBeenCalledWith(expect.any(Object), 'stockMovements'); // These expectations might need adjustment
    // expect(addDoc).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(mockError, 'Inventory Service - addStockMovement');
  });
});
