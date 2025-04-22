export const groupByKey = (array, key) => {
    return array.reduce((result, item) => {
      const keyValue = item[key];
      if (!result[keyValue]) {
        result[keyValue] = [];
      }
      result[keyValue].push(item);
      return result;
    }, {});
  };
  
  export const calculateTotal = (items, key = 'total') => {
    return items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
  };
  
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  export const sortByKey = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
  };
  
  export const filterByDateRange = (items, startDate, endDate, dateKey = 'date') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    return items.filter(item => {
      const itemDate = new Date(item[dateKey]);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  export const generateMonthlyData = (data, dateKey = 'date', valueKey = 'total') => {
    const months = {};
    
    data.forEach(item => {
      const date = new Date(item[dateKey]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = 0;
      }
      months[monthKey] += parseFloat(item[valueKey]) || 0;
    });
  
    return Object.entries(months).map(([month, value]) => ({
      month,
      value
    }));
  };
  
  export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  };
  
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };