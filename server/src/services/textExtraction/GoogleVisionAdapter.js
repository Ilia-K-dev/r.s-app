class GoogleVisionAdapter {
  constructor() {
    this.vision = require('@google-cloud/vision');
    this.client = new this.vision.ImageAnnotatorClient();
  }
  
  async extract(imageBuffer, config = {}) {
    const { language = 'en', enableHeb = false } = config;
    const hints = enableHeb ? ['he', 'en'] : [language];
    
    const request = {
      image: { content: imageBuffer.toString('base64') },
      imageContext: { languageHints: hints }
    };
    
    const [result] = await this.client.textDetection(request);
    const detections = result.textAnnotations;
    
    return {
      text: detections[0]?.description || '',
      confidence: this._calculateConfidence(detections),
      blocks: this._extractBlocks(detections)
    };
  }
}
