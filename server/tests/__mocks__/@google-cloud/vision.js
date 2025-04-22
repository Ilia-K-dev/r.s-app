const visionMock = {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
      textDetection: jest.fn().mockImplementation(() => Promise.resolve([{}]))
    })),
    mockResponse: function(response) {
      this.ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: jest.fn().mockImplementation(() => Promise.resolve([response]))
      }));
    }
  };
  
  module.exports = visionMock;
  module.exports = {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
      textDetection: jest.fn().mockImplementation(() => Promise.resolve([{}]))
    })),
    mockResponse: function(response) {
      this.ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: jest.fn().mockImplementation(() => Promise.resolve([response]))
      }));
    }
  };