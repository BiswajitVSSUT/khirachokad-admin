'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, QrCode, Download, Eye } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import Image from 'next/image';
import { VERIFICATION_BASE_URL } from '@/constants/url';
import { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDownloadQR: (product: Product) => void;
  onGenerateQR?: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete, onDownloadQR, onGenerateQR }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = new Date(product.expiryDate) < new Date();

  const generateVerificationURL = () => {
    return `${VERIFICATION_BASE_URL}${product.verificationId}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {product.description}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {product.qrCode && (
              <DropdownMenuItem onClick={() => setShowQRModal(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View QR Code
              </DropdownMenuItem>
            )}
            {!product.qrCode && product.verificationId && onGenerateQR && (
              <DropdownMenuItem onClick={() => onGenerateQR(product)}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDownloadQR(product)}>
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">₹{product.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expiry:</span>
            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
              {formatDate(product.expiryDate)}
            </span>
          </div>
          {product.verificationId && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Verification ID:</span>
              <span className="text-xs font-mono">{product.verificationId.slice(0, 8)}...</span>
            </div>
          )}
          {product.qrCode && (
            <div className="text-xs text-green-600 font-medium">
              ✅ QR Code Available
            </div>
          )}
          {!product.qrCode && product.verificationId && (
            <div className="text-xs text-yellow-600 font-medium">
              ⚠️ QR Code Not Generated
            </div>
          )}
          {isExpired && (
            <div className="text-xs text-red-600 font-medium">
              ⚠️ This product has expired
            </div>
          )}
        </div>

        {product.qrCode && (
          <div className="mt-4">
            <div 
              className="bg-white w-full cursor-pointer transition-colors grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 place-items-center"
            >
              <img 
                src={product.image} 
                alt="QR Code"
                className="object-contain border p-2 hover:border-gray-400 h-20"
              />
              <div title="Click to view full size QR code">
              <Image 
                src={product.qrCode} 
                alt="QR Code"
                height={24}
                width={24}
                className="w-24 h-24 hover:border-gray-400 border p-2 rounded-md"
                onClick={() => setShowQRModal(true)}
              />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {product.qrCode ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQRModal(true)}
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              View QR
            </Button>
          ) : product.verificationId && onGenerateQR ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onGenerateQR(product)}
              className="flex-1"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR
            </Button>
          ) : null}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDownloadQR(product)}
            className="flex-1"
            disabled={!product.qrCode}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(product)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>

      {/* QR Code Modal */}
      {product.qrCode && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrCodeUrl={product.qrCode}
          productName={product.name}
          verificationUrl={generateVerificationURL()}
        />
      )}
    </Card>
  );
}
