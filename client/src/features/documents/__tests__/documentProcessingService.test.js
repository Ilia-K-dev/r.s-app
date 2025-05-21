// client/src/features/documents/__tests__/documentProcessingService.test.js

// Import the module we want to test
import { documentProcessingService } from '../services/documentProcessingService';

// Import our test helper
const {
  createMock,
  mockUser,
  createFirestoreMocks,
  createStorageMocks,
  createFeatureFlagMocks,
  createErrorHandlerMocks,
  createApiMocks
} = require('../../../__mocks__/testHelper');

// Create our mocks
const mockFirestoreMocks = createFirestoreMocks();
const mockStorageMocks = createStorageMocks();
const mockFeatureFlagMocks = createFeatureFlagMocks(['documentsDirectIntegration']);
const mockErrorHandlerMocks = createErrorHandlerMocks();
const mockApiMocks = createApiMocks();

// Set specific mock return values if needed
mockApiMocks.post.mockResolvedValue({
  data: { imageUrl: 'https://example.com/test-image.jpg' }
});

// Mock the required modules directly in the test file
jest.mock('../../../core/config/firebase', () => ({
  app: {},
  auth: { currentUser: mockUser },
  db: {},
  storage: {}
}), { virtual: true });

jest.mock('firebase/firestore', () => mockFirestoreMocks, { virtual: true });
jest.mock('firebase/storage', () => mockStorageMocks, { virtual: true });
jest.mock('../../../core/config/featureFlags', () => mockFeatureFlagMocks, { virtual: true });
jest.mock('../../../utils/errorHandler', () => mockErrorHandlerMocks, { virtual: true });
jest.mock('axios', () => mockApiMocks, { virtual: true });

// Mock any global utilities
const mockPreprocessImage = jest.fn(() => Promise.resolve('processed-image-data'));
global.preprocessImage = mockPreprocessImage;

describe('Document Processing Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic existence test
  it('should export the expected service methods', () => {
    expect(documentProcessingService).toBeDefined();
    expect(typeof documentProcessingService.uploadDocument).toBe('function');
    expect(typeof documentProcessingService.processDocument).toBe('function');
    expect(typeof documentProcessingService.getDocumentText).toBe('function');
    expect(typeof documentProcessingService.classifyDocument).toBe('function');
  });

  describe('uploadDocument', () => {
    it('should upload a document using Firebase when feature flag is enabled', async () => {
      // Arrange
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const documentType = 'receipt';

      // Act
      await documentProcessingService.uploadDocument(file, documentType);

      // Assert
      expect(mockStorageMocks.ref).toHaveBeenCalled();
      expect(mockStorageMocks.uploadBytes).toHaveBeenCalled();
      expect(mockStorageMocks.getDownloadURL).toHaveBeenCalled();
      expect(mockFirestoreMocks.collection).toHaveBeenCalled();
      expect(mockFirestoreMocks.addDoc).toHaveBeenCalled();
    });

    it('should use API directly when feature flag is disabled', async () => {
      // Arrange
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const documentType = 'receipt';

      // Disable the feature flag for this test
      mockFeatureFlagMocks.isFeatureEnabled.mockReturnValueOnce(false);

      // Act
      await documentProcessingService.uploadDocument(file, documentType);

      // Assert
      expect(mockApiMocks.post).toHaveBeenCalled();
      expect(mockStorageMocks.ref).not.toHaveBeenCalled();
      expect(mockFirestoreMocks.collection).not.toHaveBeenCalled();
    });
  });
});
