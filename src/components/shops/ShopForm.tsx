'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Shop, ShopFormData } from '@/types/api';
import { useState, useEffect } from 'react';

const shopSchema = z.object({
  name: z.string().min(4, "Minimum 4 characters required"),
  description: z.string().min(10, 'Minimum 10 characters required'),
  logo: z.string().min(1, "Logo url is required").url('Please enter a valid URL'),
  contactNumber: z.string().length(10, 'Enter a 10 digit mobile number'),
  contactNumber2: z.string().optional(),
  contactEmail: z.email('Please enter a valid email'),
  postalCode: z.string().optional(),
  blockName: z.string().optional(),
  district: z.string().optional(),
});

type ShopFormSchema = z.infer<typeof shopSchema>;

type User = {
  id: string,
  name: string,
  email: string,
  avatar: string
}

interface ShopFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormData) => void;
  isLoading: boolean;
  initialData?: Shop;
  title: string;
}

export default function ShopForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  title
}: ShopFormProps) {

  const [user, setUser] = useState<User | null>(null)

  // Use useEffect to handle side effects like localStorage access
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, []); // Empty dependency array means this runs once on mount

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopFormSchema>({
    resolver: zodResolver(shopSchema),
    defaultValues: initialData || {
      name: 'MATRUSHAKTI INTERNATIONAL',
      description: 'Khira Chokada - Pure and healthy nutrition for your livestock',
      logo: 'https://admin.khirachokada.com/kc-logo.svg',
      contactNumber: '8018173958',
      contactNumber2: '',
      contactEmail: 'matrushakti.international@yahoo.com',
      postalCode: '',
      blockName: '',
      district: 'Puri',
    },
  });

  const handleFormSubmit = (data: ShopFormSchema) => {
    const parsedData: ShopFormData = {
      ...data,
      userId: user ? user.id : "",
      contactNumber2: data.contactNumber2 == '' ? undefined : data.contactNumber2,
      postalCode: data.postalCode == '' ? undefined : data.postalCode,
      blockName: data.blockName == '' ? undefined : data.blockName,
      district: data.district == '' ? undefined : data.district,
    }
    onSubmit(parsedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update shop information' : 'Add a new shop to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="responsive-form">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name * (min. 4 characters)</Label>
              <Input
                id="name"
                placeholder="Enter shop name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="Enter contact email"
                {...register('contactEmail')}
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description * (min. 10 characters)</Label>
            <Input
              id="description"
              placeholder="Enter shop description"
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="responsive-form">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                placeholder="Enter primary contact number"
                {...register('contactNumber')}
                className={errors.contactNumber ? 'border-red-500' : ''}
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-600">{errors.contactNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber2">Secondary Contact Number</Label>
              <Input
                id="contactNumber2"
                placeholder="Enter secondary contact number"
                {...register('contactNumber2')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL *</Label>
            <Input
              id="logo"
              readOnly
              disabled
              placeholder="Enter logo URL"
              {...register('logo')}
              className={errors.logo ? 'border-red-500' : ''}
            />
            {errors.logo && (
              <p className="text-sm text-red-600">{errors.logo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="Enter postal code"
                {...register('postalCode')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockName">Block Name</Label>
              <Input
                id="blockName"
                placeholder="Enter block name"
                {...register('blockName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Enter district"
                {...register('district')}
              />
            </div>
          </div>

          <DialogFooter className='gap-4'>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Shop' : 'Create Shop'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}