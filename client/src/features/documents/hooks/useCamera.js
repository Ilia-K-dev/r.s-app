import { useState, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setStream(mediaStream);
      setError(null);
      return mediaStream;
    } catch (err) {
      setError('Failed to access camera');
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!stream) throw new Error('Camera not started');

    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // required for iOS

    try {
      await video.play();
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(new File([blob], 'captured-photo.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.9);
      });
    } catch (err) {
      setError('Failed to capture photo');
      throw err;
    } finally {
      video.remove();
    }
  }, [stream]);

  const switchCamera = useCallback(async () => {
    if (stream) {
      const currentFacingMode = stream.getVideoTracks()[0].getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      
      stopCamera();
      
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: newFacingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        setStream(newStream);
        setError(null);
        return newStream;
      } catch (err) {
        setError('Failed to switch camera');
        throw err;
      }
    }
  }, [stream, stopCamera]);

  return {
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    isActive: !!stream
  };
};

export default useCamera;