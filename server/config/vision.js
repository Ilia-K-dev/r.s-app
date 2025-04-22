const vision = require('@google-cloud/vision');
const path = require('path');
const dotenv = require('dotenv');
const { AppError } = require('../src/utils/error/AppError'); //good

dotenv.config();

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

module.exports = visionClient;