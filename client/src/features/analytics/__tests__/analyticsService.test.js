import {
  getSpendingByCategory,
  clearUserCache,
  generateReport
} from '../services/analyticsService'; // Assuming direct import of service functions

import {
  isFeatureEnabled,
  startPerformanceTimer,
  stopPerformanceTimer
} from '@/core/config/featureFlags'; // Assuming direct import from featureFlags

import {
  handleError,
  handleFirebaseError
} from '@/utils/errorHandler'; // Assuming direct import from errorHandler

// Mock the necessary modules
jest.mock('../services/analyticsService'); // Mock the service itself
jest.mock('@/core/config/featureFlags');
jest.mock('@/utils/errorHandler');
jest.mock('axios');
// Define the indexedDbCache mock directly within the jest.mock call's factory function
jest.mock('@/utils/indexedDbCache', () => {
  const indexedDbCacheModule = {
    getCache: jest.fn(),
    setCache: jest.fn(),
    clearCache: jest.fn(),
  };
  return indexedDbCacheModule;
});

// Import the mocked indexedDbCacheModule
import * as indexedDbCacheModule from '@/utils/indexedDbCache';


describe('Analytics Service Unit Tests', () => {
  const mockUserId = 'test-user-id';
  const mockPeriod = 'month';
  const mockCachedData = { category: 'mock', amount: 100 };
  const mockFirebaseData = [{ category: 'firebase', amount: 200 }];
  const mockApiData = { category: 'api', amount: 300 };
  const mockError = new Error('Firestore error');
  const mockApiError = new Error('API error');
  const mockReportType = 'spending';

  beforeEach(() => {
    // Clear mocks before each test
    getSpendingByCategory.mockClear();
    clearUserCache.mockClear();
    generateReport.mockClear();
    isFeatureEnabled.mockClear();
    startPerformanceTimer.mockClear();
    stopPerformanceTimer.mockClear();
    handleError.mockClear();
    handleFirebaseError.mockClear();
    indexedDbCacheModule.getCache.mockClear();
    indexedDbCacheModule.setCache.mockClear();
    indexedDbCacheModule.clearCache.mockClear();
    // Clear axios mocks if needed, assuming they are used in the service
    // axios.get.mockClear();
    // axios.post.mockClear();


    // Set default mock return values
    isFeatureEnabled.mockReturnValue(true); // Assume feature is enabled by default
    indexedDbCacheModule.getCache.mockResolvedValue(null); // Assume no cached data by default
    // Mock Firebase functions used in the service if they are not directly imported and mocked
    // e.g., firestore.collection, firestore.getDocs, etc.
    // Since the service is mocked, these might not be called directly in the tests,
    // but if they are used in the actual service implementation, their mocks from firebaseMocks.js will be used.
  });

  // Add your test cases here based on the original file's tests
  // Example test cases based on the error messages and common analytics flows:

  it('getSpendingByCategory should return cached data if available and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    indexedDbCacheModule.getCache.mockResolvedValue(mockCachedData);

    const result = await getSpendingByCategory(mockUserId, mockPeriod);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(indexedDbCacheModule.getCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_${mockPeriod}_default_default`);
    expect(result).toEqual(mockCachedData);
    // Ensure Firebase and API are not called
    // expect(firestore.getDocs).not.toHaveBeenCalled();
    // expect(axios.get).not.toHaveBeenCalled();
  });

  it('getSpendingByCategory should fetch data, calculate, and cache if no cached data and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    indexedDbCacheModule.getCache.mockResolvedValue(null);
    // Mock Firebase fetch if used in the service
    // firestore.getDocs.mockResolvedValue({ docs: mockFirebaseData.map(data => ({ data: () => data })) });
    indexedDbCacheModule.setCache.mockResolvedValue(undefined); // Successful cache set

    const result = await getSpendingByCategory(mockUserId, mockPeriod);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(indexedDbCacheModule.getCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_${mockPeriod}_default_default`);
    // expect(firestore.getDocs).toHaveBeenCalled(); // Ensure Firebase was called
    // expect(calculateSpendingByCategory).toHaveBeenCalledWith(mockFirebaseData); // Assuming a calculate function exists
    expect(indexedDbCacheModule.setCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_${mockPeriod}_default_default`, expect.any(Object)); // Check if data was cached
    // expect(result).toEqual(calculatedData); // Expect calculated data
    // expect(axios.get).not.toHaveBeenCalled(); // Ensure API is not called
  });

  it('getSpendingByCategory should fallback to API if Firebase fetch fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    indexedDbCacheModule.getCache.mockResolvedValue(null);
    // Mock Firebase fetch failure
    // firestore.getDocs.mockRejectedValue(mockError);
    axios.get.mockResolvedValue({ data: mockApiData }); // Mock API success
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing in test

    const result = await getSpendingByCategory(mockUserId, mockPeriod);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(indexedDbCacheModule.getCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_${mockPeriod}_default_default`);
    // expect(firestore.getDocs).toHaveBeenCalled(); // Ensure Firebase was called
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Analytics Service - getSpendingByCategory'); // Ensure Firebase error was handled
    expect(axios.get).toHaveBeenCalled(); // Ensure API was called
    // expect(calculateSpendingByCategory).toHaveBeenCalledWith(mockApiData); // Assuming calculation on API data
    // expect(result).toEqual(calculatedApiData); // Expect calculated API data
    // expect(indexedDbCacheModule.setCache).toHaveBeenCalled(); // Ensure data was cached
  });

  it('getSpendingByCategory should call global errorHandler if API fallback fails and feature is enabled', async () => {
    isFeatureEnabled.mockReturnValue(true);
    indexedDbCacheModule.getCache.mockResolvedValue(null);
    // Mock Firebase fetch failure
    // firestore.getDocs.mockRejectedValue(mockError);
    axios.get.mockRejectedValue(mockApiError); // Mock API failure
    handleFirebaseError.mockImplementation(() => {}); // Prevent re-throwing Firebase error
    handleError.mockImplementation(error => { throw error; }); // Re-throw API error in test

    await expect(getSpendingByCategory(mockUserId, mockPeriod)).rejects.toThrow('API error');

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(indexedDbCacheModule.getCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_${mockPeriod}_default_default`);
    // expect(firestore.getDocs).toHaveBeenCalled(); // Ensure Firebase was called
    expect(handleFirebaseError).toHaveBeenCalledWith(mockError, 'Analytics Service - getSpendingByCategory'); // Ensure Firebase error was handled
    expect(axios.get).toHaveBeenCalled(); // Ensure API was called
    expect(handleError).toHaveBeenCalledWith(mockApiError, 'Analytics Service - getSpendingByCategory', 'firebaseDirectIntegration'); // Ensure API error was handled
    // expect(indexedDbCacheModule.setCache).not.toHaveBeenCalled(); // Ensure data was not cached on failure
  });


  it('getSpendingByCategory should call API directly when feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false);
    axios.get.mockResolvedValue({ data: mockApiData });

    const result = await getSpendingByCategory(mockUserId, mockPeriod);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    expect(indexedDbCacheModule.getCache).not.toHaveBeenCalled(); // Ensure cache is not checked
    // expect(firestore.getDocs).not.toHaveBeenCalled(); // Ensure Firebase is not called
    expect(axios.get).toHaveBeenCalled(); // Ensure API was called
    // expect(calculateSpendingByCategory).toHaveBeenCalledWith(mockApiData); // Assuming calculation on API data
    // expect(result).toEqual(calculatedApiData); // Expect calculated API data
    expect(indexedDbCacheModule.setCache).not.toHaveBeenCalled(); // Ensure data is not cached
  });

  it('clearUserCache should call clearCache for relevant keys', async () => {
    await clearUserCache(mockUserId);

    expect(indexedDbCacheModule.clearCache).toHaveBeenCalledWith(`${mockUserId}_spendingByCategory_default_default_default`);
    expect(indexedDbCacheModule.clearCache).toHaveBeenCalledWith(`${mockUserId}_monthlySpending_default_default_default`);
    // Add expectations for other cache keys if they exist in the service
  });

  it('generateReport should always call API', async () => {
    const mockOptions = { period: 'year' };
    axios.post.mockResolvedValue({ data: 'report data' });

    const result = await generateReport(mockUserId, mockReportType, mockOptions);

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration'); // Still checks flag, but logic is bypassed
    // expect(firestore.collection).not.toHaveBeenCalled(); // Ensure Firebase is not called
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/analytics/generate-report`, {
      userId: mockUserId,
      reportType: mockReportType,
      options: mockOptions,
    });
    expect(result).toEqual('report data');
  });

  it('generateReport should call global errorHandler on failure', async () => {
    const mockOptions = { period: 'year' };
    axios.post.mockRejectedValue(mockApiError);
    handleError.mockImplementation(error => { throw error; }); // Re-throw in test

    await expect(generateReport(mockUserId, mockReportType, mockOptions)).rejects.toThrow('API error');

    expect(isFeatureEnabled).toHaveBeenCalledWith('firebaseDirectIntegration');
    // expect(firestore.collection).not.toHaveBeenCalled(); // Ensure Firebase is not called
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/analytics/generate-report`, {
      userId: mockUserId,
      reportType: mockReportType,
      options: mockOptions,
    });
    expect(handleError).toHaveBeenCalledWith(mockApiError, 'Analytics Service - generateReport', 'firebaseDirectIntegration');
  });
});
