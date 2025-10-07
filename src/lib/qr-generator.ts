import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCode = async (
  data: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: options.size || 200,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF'
    }
  };

  try {
    const dataUrl = await QRCode.toDataURL(data, defaultOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeCanvas = async (
  canvas: HTMLCanvasElement,
  data: string,
  options: QRCodeOptions = {}
): Promise<void> => {
  const defaultOptions = {
    width: options.size || 200,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF'
    }
  };

  try {
    await QRCode.toCanvas(canvas, data, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code to canvas:', error);
    throw new Error('Failed to generate QR code to canvas');
  }
};

export const generateQRCodeWithImage = async (
  data: string,
  imageUrl?: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: options.size || 200,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF'
    }
  };

  try {
    // Generate base QR code
    const qrDataUrl = await QRCode.toDataURL(data, defaultOptions);
    
    if (!imageUrl) {
      return qrDataUrl;
    }

    // Create canvas to combine QR code with image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size
    canvas.width = defaultOptions.width;
    canvas.height = defaultOptions.width;

    // Load and draw QR code
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
    
    ctx.drawImage(qrImage, 0, 0);

    // Load and draw product image in center
    const productImage = new Image();
    productImage.crossOrigin = 'anonymous'; // Handle CORS
    
    await new Promise((resolve, reject) => {
      productImage.onload = resolve;
      productImage.onerror = () => {
        console.warn('Failed to load product image, using QR code without image');
        resolve(null);
      };
      productImage.src = "";
    });

    if (productImage.complete && productImage.naturalWidth > 0) {
      // Calculate center position and size for the product image
      const centerSize = Math.floor(defaultOptions.width * 0.2); // 20% of QR code size
      const centerX = (defaultOptions.width - centerSize) / 2;
      const centerY = (defaultOptions.width - centerSize) / 2;

      // Draw white background for the center image
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(centerX - 2, centerY - 2, centerSize + 4, centerSize + 4);

      // Draw the product image
      ctx.drawImage(productImage, centerX, centerY, centerSize, centerSize);
    }

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR code with image:', error);
    // Fallback to regular QR code if image processing fails
    return generateQRCode(data, options);
  }
};

export const downloadQRCode = (dataUrl: string, filename: string = 'qr-code.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
