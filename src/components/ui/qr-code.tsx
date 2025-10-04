'use client';

import { useEffect, useRef, useState } from 'react';
import { generateQRCodeWithImage } from '@/lib/qr-generator';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

export default function QRCodeComponent({ value, size = 200, className = '', imageUrl }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current) {
        try {
          // Generate QR code with optional image
          const dataUrl = await generateQRCodeWithImage(value, imageUrl, { size });
          
          // Draw the generated QR code to canvas
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, size, size);
            };
            img.src = dataUrl;
          }
          
          setQrDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    generateQR();
  }, [value, size, imageUrl]);

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-gray-200 rounded-md"
      />
      {qrDataUrl && (
        <a
          href={qrDataUrl}
          download={`qr-code-${Date.now()}.png`}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download QR Code
        </a>
      )}
    </div>
  );
}
