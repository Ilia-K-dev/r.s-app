const {onFinalize} = require("firebase-functions/v2/storage");
const {onCall} = require("firebase-functions/v2/https"); // Corrected this line
const vision = require("@google-cloud/vision");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient();

// Process the uploaded receipt image
exports.processReceipt = onFinalize(async (object) => {
  try {
    // Get the file details
    const file = object;
    const filePath = file.name;

    // Call Google Cloud Vision API to analyze the receipt image
    const [result] = await client.textDetection(`gs://${file.bucket}/${filePath}`);
    const detections = result.textAnnotations;

    if (detections.length > 0) {
      const receiptText = detections[0].description;

      // You can now process the receipt text as needed
      logger.info(`Detected text: ${receiptText}`);

      // Optionally, save the results in Firestore or another database
      const db = admin.firestore();
      await db.collection("receipts").add({
        filePath,
        receiptText,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Receipt processed and saved to Firestore");
    }
  } catch (error) {
    logger.error("Error processing receipt:", error);
  }
});

// Generate report (example callable function)
exports.generateReport = onCall(async (data, context) => {
  try {
    // Report generation logic here
    logger.info("Generating report with data:", data);

    // Sample return
    return {
      status: "success",
      message: "Report generated successfully!",
    };
  } catch (error) {
    logger.error("Error generating report:", error);
    throw new onCall.HttpsError("internal", "Failed to generate report", error);
  }
});
