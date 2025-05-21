const validator = require('validator');

class InputSanitizer {
  static sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return validator.escape(validator.trim(input));
  }
  
  static sanitizeObject(obj) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
