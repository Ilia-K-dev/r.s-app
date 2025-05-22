class TesseractAdapter {
  constructor() {
    this.tesseract = require('tesseract.js');
  }
  
  async extract(imageBuffer, config = {}) {
    const { language = 'eng', enableHeb = false } = config;
    const langs = enableHeb ? ['eng', 'heb'] : [language];
    
    const result = await this.tesseract.recognize(
      imageBuffer,
      langs.join('+'),
      {
        logger: m => console.log(m),
        preserve_interword_spaces: '1'
      }
    );
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
      language: result.data.languages,
      blocks: result.data.blocks
    };
  }
}
