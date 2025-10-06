'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {generateQRCodeWithImage, downloadQRCode } from '@/lib/qr-generator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { VERIFICATION_BASE_URL } from '@/constants/url';
import { ProductFormData } from '@/types/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').min(5 , "Minimum 5 characters are required"),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().min(1 , "URL is required").url('Please enter a valid URL'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  verificationId : z.string().optional()
});

type ProductFormSchema = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
  initialData?: Partial<ProductFormData>;
  title: string;
}

export default function ProductForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  initialData,
  title 
}: ProductFormProps) {
  const [generatedQRCode, setGeneratedQRCode] = useState<string>('');
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: 'Khira Chokada',
      description: 'Khira Chokada - Pure and healthy nutrition for your livestock',
      price: '1000',
      image: 'https://admin.khirachokada.com/kc-logo.svg',
      expiryDate: '',
    },
  });

  const watchedValues = watch();

  const generateVerificationURL = (verificationId?: string) => {
    if (!verificationId) {
      throw new Error('Verification ID is required to generate QR code');
    }
    return `${VERIFICATION_BASE_URL}${verificationId}`;
  };

  const handleGenerateQR = async () => {
    if (!watchedValues.name || !watchedValues.description) {
      alert('Please fill in product name and description before generating QR code');
      return;
    }

    if (!initialData?.verificationId) {
      alert('Verification ID is required. Please save the product first to get a verification ID.');
      return;
    }

    setIsGeneratingQR(true);
    try {
      const verificationURL = generateVerificationURL(initialData.verificationId);
      const qrDataUrl = await generateQRCodeWithImage(verificationURL, watchedValues.image, { size: 200 });
      setGeneratedQRCode(qrDataUrl);
      setShowQRPreview(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (generatedQRCode) {
      const filename = `${watchedValues.name || 'product'}-qr-code.png`;
      downloadQRCode(generatedQRCode, filename);
    }
  };

  const handleFormSubmit = (data: ProductFormSchema) => {
    const formattedExpiryDate = new Date(data.expiryDate).toISOString();
    const submitData: ProductFormData = {
      ...data,
      expiryDate: formattedExpiryDate,
      qrCode: generatedQRCode || undefined
    };
    onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    setGeneratedQRCode('');
    setShowQRPreview(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update product information' : 'Add a new product and generate QR code'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="responsive-form">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name * (min. 5 characters)</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                {...register('price')}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Enter product description"
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image URL *</Label>
            <Input
              id="image"
              readOnly
              disabled
              placeholder="Enter product image URL"
              {...register('image')}
              className={errors.image ? 'border-red-500' : ''}
            />
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="datetime-local"
              {...register('expiryDate')}
              className={errors.expiryDate ? 'border-red-500' : ''}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-600">{errors.expiryDate.message}</p>
            )}
          </div>

          <DialogFooter className='gap-4'>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
