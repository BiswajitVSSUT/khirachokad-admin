'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { productAPI, shopAPI } from '@/lib/api';
import { generateQRCodeWithImage } from '@/lib/qr-generator';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductCard from '@/components/products/ProductCard';
import ProductForm from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Package, QrCode } from 'lucide-react';
import { VERIFICATION_BASE_URL } from '@/constants/url';
import { Product, Shop, ProductFormData, UpdateProductData, ApiError } from '@/types/api';
import { isApiError } from '@/types/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const shopId = params.shopId as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (isAuthenticated && shopId) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router, shopId]);

  const generateQRForProduct = async (product: Product) => {
    if (!product.verificationId) return product;

    try {
      const verificationURL = `${VERIFICATION_BASE_URL}${product.verificationId}`;
      const qrCodeDataUrl = await generateQRCodeWithImage(verificationURL, product.image, { size: 200 });

      // Update the product with the generated QR code
      const updateResponse = await productAPI.update({
        ...product,
        qrCode: qrCodeDataUrl
      });

      if (updateResponse.success) {
        return { ...product, qrCode: qrCodeDataUrl };
      }
    } catch (error) {
      console.error('Error generating QR code for product:', product.name, error);
    }

    return product;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch shop details
      const shopResponse = await shopAPI.getAll();
      if (shopResponse.success && shopResponse.data) {
        const foundShop = shopResponse.data.find((s: Shop) => s.id === shopId);
        if (foundShop) {
          setShop(foundShop);
        } else {
          setError('Shop not found');
          return;
        }
      }

      // Fetch products
      const productResponse = await productAPI.getByShop(shopId);
      if (productResponse.success) {
        const products = productResponse.data || [];

        // Generate QR codes for products that don't have them
        const productsWithQR = await Promise.all(
          products.map(async (product: Product) => {
            if (!product.qrCode && product.verificationId) {
              return await generateQRForProduct(product);
            }
            return product;
          })
        );

        setProducts(productsWithQR);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await productAPI.delete(id);
      if (response.success) {
        setProducts(products.filter(product => product.id !== id));
      } else {
        setError('Failed to delete product');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to delete product');
    }
  };

  const handleDownloadQR = (product: Product) => {
    if (product.qrCode) {
      const filename = `${product.name}-qr-code.png`;
      // Use the downloadQRCode utility function
      const link = document.createElement('a');
      link.href = product.qrCode;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateQR = async (product: Product) => {
    try {
      const updatedProduct = await generateQRForProduct(product);
      if (updatedProduct.qrCode) {
        // Update the product in the list
        setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      }
    } catch (error: unknown) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      let response;
      if (editingProduct) {
        response = await productAPI.update({ ...data, id: editingProduct.id, shopId });
      } else {
        response = await productAPI.create({ ...data, shopId });
      }

      if (response.success && response.data) {
        // Generate QR code for the product if it has a verificationId
        const productData = response.data;
        if (productData.verificationId) {
          try {
            const verificationURL = `${VERIFICATION_BASE_URL}${productData.verificationId}`;
            const qrCodeDataUrl = await generateQRCodeWithImage(verificationURL, data.image, { size: 200 });

            // Update the product with the generated QR code
            const updateData: UpdateProductData = {
              ...productData,
              qrCode: qrCodeDataUrl
            };
            await productAPI.update(updateData);
          } catch (qrError: unknown) {
            console.error('Error generating QR code:', qrError);
            // Continue even if QR generation fails
          }
        }

        setIsFormOpen(false);
        setEditingProduct(null);
        fetchData(); // Refresh the list
      } else {
        setError(response.message || 'Failed to save product');
      }
    } catch (err: unknown) {
      setError(isApiError(err) ? err.message : 'Failed to save product');
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

  if (!shop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Shop not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The shop you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <p className="text-gray-600">Products & QR Codes</p>
            </div>
          </div>
          <Button onClick={handleCreateProduct} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
        </div>

        {/* Shop info */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Contact:</span>
              <p className="font-medium">{shop.contactNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium">{shop.contactEmail}</p>
            </div>
            <div>
              <span className="text-muted-foreground">District:</span>
              <p className="font-medium">{shop.district || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new product and generating its QR code.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onDownloadQR={handleDownloadQR}
                onGenerateQR={handleGenerateQR}
              />
            ))}
          </div>
        )}

        {/* Product form modal */}
        <ProductForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          initialData={editingProduct || undefined}
          title={editingProduct ? 'Edit Product' : 'Create New Product'}
        />
      </div>
    </DashboardLayout>
  );
}
