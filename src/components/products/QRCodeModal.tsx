'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';
import { downloadQRCode } from '@/lib/qr-generator';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  productName: string;
  verificationUrl: string;
}

export default function QRCodeModal({ 
  isOpen, 
  onClose, 
  qrCodeUrl, 
  productName,
  verificationUrl 
}: QRCodeModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `${productName}-qr-code.png`;
      downloadQRCode(qrCodeUrl, filename);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {productName}</DialogTitle>
          <DialogDescription>
            Product verification QR code
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <img 
              src={qrCodeUrl} 
              alt="QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>

          {/* Verification URL */}
          <div className="w-full p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-1">Verification URL:</p>
            <p className="text-sm font-mono break-all text-gray-800">
              {verificationUrl}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download QR Code'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
