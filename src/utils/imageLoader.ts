// Utility for handling image loading with better error handling and retries
export const loadImage = (src: string, fallbackSrc?: string): Promise<HTMLImageElement> => {
  const maxRetries = 2;
  let retryCount = 0;

  const tryLoadImage = (resolve: (img: HTMLImageElement) => void, reject: (error: Error) => void) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    
    img.onerror = async () => {
      if (retryCount < maxRetries) {
        retryCount++;
        // Add cache buster to URL to prevent cached error responses
        const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}_=${Date.now()}`;
        img.src = cacheBuster;
      } else if (fallbackSrc) {
        // Try fallback image if available
        img.src = fallbackSrc;
      } else {
        reject(new Error(`Failed to load image after ${maxRetries} retries`));
      }
    };

    // Start loading the image
    img.src = src;
  };

  return new Promise((resolve, reject) => tryLoadImage(resolve, reject));
};

// Default fallback images
export const FALLBACK_IMAGES = {
  PROFILE: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  CHANNEL: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y',
  THUMBNAIL: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=1200&auto=format&fit=crop&q=80',
};