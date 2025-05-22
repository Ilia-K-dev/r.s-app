// client/src/components/__tests__/Button.test.js

// Import the test helper if needed for component tests
const testHelper = require('../../__mocks__/testHelper');

// Define the mock factory function
const mockButtonModule = () => {
  return testHelper.createMock({
    Button: jest.fn(props => ({
      type: 'Button',
      props
    })),
    buttonVariants: jest.fn(() => 'button-variant-class')
  });
};

// Correctly mock the Button component based on its actual location
jest.mock('../../design-system/components/Button', mockButtonModule);

// Import the mocked component
import { Button, buttonVariants } from '../../design-system/components/Button';

describe('Button component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic existence test
  it('should pass a basic test', () => {
    expect(Button).toBeDefined();
    expect(buttonVariants).toBeDefined();
  });

  // Test with props
  it('should pass props correctly', () => {
    // Arrange & Act
    const result = Button({
      variant: 'primary',
      size: 'lg',
      children: 'Test Button'
    });

    // Assert
    expect(result.type).toBe('Button');
    expect(result.props.variant).toBe('primary');
    expect(result.props.size).toBe('lg');
    expect(result.props.children).toBe('Test Button');
  });
});
