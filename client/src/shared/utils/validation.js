export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
    return re.test(password);
  };
  
  export const validatePhoneNumber = (phoneNumber) => {
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(phoneNumber);
  };
  
  export const validateName = (name) => {
    const re = /^[a-zA-Z ]{2,30}$/;
    return re.test(name);
  };
  export const validateAmount = (amount) => {
    if (!amount) return { isValid: false, error: 'Amount is required' };
    const value = parseFloat(amount);
    if (isNaN(value)) return { isValid: false, error: 'Invalid amount' };
    if (value <= 0) return { isValid: false, error: 'Amount must be greater than 0' };
    return { isValid: true, error: null };
  };
  
  export const validateRequired = (value, field) => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${field} is required` };
    }
    return { isValid: true, error: null };
  };