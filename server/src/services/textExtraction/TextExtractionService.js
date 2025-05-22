const HebrewNormalizer = require('../../utils/text/hebrewNormalizer');

class TextExtractionService extends BaseService {
  constructor() {
    super();
    this.visionAdapter = new GoogleVisionAdapter();
    this.tesseractAdapter = new TesseractAdapter();
  }
  
  async extractText(imageBuffer, config) {
    const complexity = await this.assessComplexity(imageBuffer);
    
    let result;
    if (complexity.score > 0.7) {
      result = await this.visionAdapter.extract(imageBuffer, config);
    } else {
      result = await this.tesseractAdapter.extract(imageBuffer, config);
    }

    if (HebrewNormalizer.detectHebrewText(result.text)) {
      result.normalizedText = HebrewNormalizer.normalizeHebrewText(result.text);
    }
    
    return result;
  }
  
  async assessComplexity(imageBuffer) {
    // Implement complexity scoring
    return {
      score: 0.5,
      factors: { hasHandwriting: false, isScanned: true }
    };
  }
}
