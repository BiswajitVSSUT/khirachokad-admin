'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { shopAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ShopCard from '@/components/shops/ShopCard';
import ShopForm from '@/components/shops/ShopForm';
import { Button } from '@/components/ui/button';
import { Plus, Store } from 'lucide-react';
import { Shop, ShopFormData, ApiError } from '@/types/api';
import { isApiError } from '@/types/api';

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (isAuthenticated) {
      fetchShops();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const response = await shopAPI.getAll();
      if (response.success) {
        console.log(response.data)
        setShops(response.data || []);
      } else {
        setError('Failed to fetch shops');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to fetch shops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShop = () => {
    setEditingShop(null);
    setIsFormOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setIsFormOpen(true);
  };

  const handleDeleteShop = async (id: string) => {
    try {
      const response = await shopAPI.delete(id);
      if (response.success) {
        setShops(shops.filter(shop => shop.id !== id));
      } else {
        setError('Failed to delete shop');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to delete shop');
    }
  };

  const handleViewProducts = (shopId: string) => {
    router.push(`/shops/${shopId}/products`);
  };

  const handleFormSubmit = async (data: ShopFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      let response;
      if (editingShop) {
        response = await shopAPI.update({ ...data, id: editingShop.id });
      } else {
        response = await shopAPI.create(data);
      }

      if (response.success) {
        setIsFormOpen(false);
        setEditingShop(null);
        fetchShops(); // Refresh the list
      } else {
        setError(response.message || 'Failed to save shop');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to save shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shops Management</h1>
            <p className="text-gray-600">Manage your shops and their QR codes</p>
          </div>
          <Button onClick={handleCreateShop} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Shop
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Shops grid */}
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shops</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new shop.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateShop}>
                <Plus className="mr-2 h-4 w-4" />
                Create Shop
              </Button>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onEdit={handleEditShop}
                onDelete={handleDeleteShop}
                onViewProducts={handleViewProducts}
              />
            ))}
          </div>
        )}

        {/* Shop form modal */}
        <ShopForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingShop(null);
          }}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          initialData={editingShop || undefined}
          title={editingShop ? 'Edit Shop' : 'Create New Shop'}
        />
      </div>
    </DashboardLayout>
  );
}