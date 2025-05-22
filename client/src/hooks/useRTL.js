import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);
  
  return { isRTL, toggleDirection: () => i18n.changeLanguage(isRTL ? 'en' : 'he') };
};
