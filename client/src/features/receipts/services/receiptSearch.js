import { useTranslation } from 'react-i18next';
import { firestore } from '@/core/config/firebase'; // Assuming firestore is exported from firebase config
import { HebrewNormalizer } from '@/utils/text/hebrewNormalizer'; // Assuming HebrewNormalizer is exported

export const searchReceipts = async (searchTerm) => {
  const { i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';
  
  // For Hebrew, search both normalized and original text
  let queries = [];
  
  if (isHebrew) {
    const hebrewSearchTerm = HebrewNormalizer.normalizeHebrewText(searchTerm);
    queries = [
      firestore()
        .collection('receipts')
        .where('merchantHe', '>=', hebrewSearchTerm)
        .where('merchantHe', '<=', hebrewSearchTerm + '\uf8ff'),
      firestore()
        .collection('receipts')
        .where('itemsHe', 'array-contains', hebrewSearchTerm)
    ];
  } else {
    queries = [
      firestore()
        .collection('receipts')
        .where('merchant', '>=', searchTerm)
        .where('merchant', '<=', searchTerm + '\uf8ff')
    ];
  }
  
  const results = await Promise.all(queries.map(q => q.get()));
  return results.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
