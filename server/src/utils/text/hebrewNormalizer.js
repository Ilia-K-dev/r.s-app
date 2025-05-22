class HebrewNormalizer {
  static normalizeHebrewText(text) {
    // Remove niqqud (vowel points)
    text = text.replace(/[\u0591-\u05C7]/g, '');
    
    // Normalize final letters
    const finalLetters = {
      'ך': 'כ',
      'ם': 'מ',
      'ן': 'נ',
      'ף': 'פ',
      'ץ': 'צ'
    };
    
    text = text.replace(/[ךםןףץ]/g, char => finalLetters[char]);
    
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  static detectHebrewText(text) {
    const hebrewRegex = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
    return hebrewRegex.test(text);
  }
}
