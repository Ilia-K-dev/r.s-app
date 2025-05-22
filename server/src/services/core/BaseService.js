class BaseService {
  constructor() {
    this.logger = require('../../utils/logger');
  }
  
  async execute() {
    throw new Error('Method must be implemented');
  }
  
  handleError(error) {
    this.logger.error(error);
    throw new AppError(error.message, error.statusCode || 500);
  }
}
