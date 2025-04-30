// src/features/documents/utils/imageProcessing.js

export const processImage = async (file, options = {}) => {
  try {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await createImageBitmap(file);

    // Apply rotation if specified
    const rotation = options.rotation || 0;
    const zoom = options.zoom || 1;

    // Set dimensions (max width 1920px)
    const maxWidth = 1920;
    const scaleFactor = maxWidth / img.width;
    let width = img.width * (scaleFactor < 1 ? scaleFactor : 1) * zoom;
    let height = img.height * (scaleFactor < 1 ? scaleFactor : 1) * zoom;

    // Adjust canvas size for rotation
    if (rotation % 180 !== 0) {
      [width, height] = [height, width];
    }

    canvas.width = width;
    canvas.height = height;

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(
      img,
      (-img.width * scaleFactor) / 2,
      (-img.height * scaleFactor) / 2,
      img.width * scaleFactor,
      img.height * scaleFactor
    );

    // Convert to blob
    return new Promise(resolve => {
      canvas.toBlob(
        blob => {
          resolve(
            new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
          );
        },
        'image/jpeg',
        0.9
      );
    });
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};
