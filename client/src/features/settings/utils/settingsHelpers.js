export const getDefaultSettings = () => {
    return {
      notifications: {
        email: true,
        push: true
      },
      theme: 'light',
      currency: 'USD',
      language: 'en'
    };
  };
  
  export const getSettingValue = (settings, key) => {
    return key.split('.').reduce((obj, prop) => obj && obj[prop], settings);
  };
  
  export const setSettingValue = (settings, key, value) => {
    const props = key.split('.');
    const lastProp = props.pop();
    const settingsRef = props.reduce((obj, prop) => obj[prop], settings);
    settingsRef[lastProp] = value;
  };