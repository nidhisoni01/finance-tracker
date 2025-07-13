// Utility to crop an image file using canvas and react-easy-crop pixel data
export default function getCroppedImg(file, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Convert blob to File for upload compatibility
        const croppedFile = new File([blob], file.name, { type: file.type });
        resolve(croppedFile);
      }, file.type || 'image/jpeg');
    };
    image.onerror = error => reject(error);
  });
} 