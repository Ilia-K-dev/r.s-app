const storageMock = {
    bucket: jest.fn().mockReturnValue({
      file: jest.fn().mockReturnValue({
        save: jest.fn(),
        getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/test.jpg'])
      })
    }),
    mockReturnValue: function(implementation) {
      this.bucket.mockReturnValue(implementation);
    }
  };
  
  module.exports = storageMock;