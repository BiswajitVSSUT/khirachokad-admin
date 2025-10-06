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
import { MoreVertical, Edit, Trash2, QrCode } from 'lucide-react';
import { Shop } from '@/types/api';

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDelete: (id: string) => void;
  onViewProducts: (shopId: string) => void;
}

export default function ShopCard({ shop, onEdit, onDelete, onViewProducts }: ShopCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${shop.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(shop.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">{shop.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {shop.description}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewProducts(shop.id)}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Codes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(shop)}>
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
            <span className="text-muted-foreground">Contact:</span>
            <span>{shop.contactNumber}</span>
          </div>
          {shop.contactNumber2 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Secondary:</span>
              <span>{shop.contactNumber2}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="truncate">{shop.contactEmail}</span>
          </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">District:</span>
              <span>{shop.district ? shop.district : "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Block:</span>
              <span>{shop.blockName ? shop.blockName : "N/A"}</span>
            </div>
        </div>
        <div className='w-full h-24 flex justify-center items-center mt-2 overflow-hidden'>
          <img 
          src={shop.logo} 
          alt="Shop image"
          className='object-contain h-full w-full'/>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewProducts(shop.id)}
            className="flex-1"
          >
            <QrCode className="mr-2 h-4 w-4" />
            View Products
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(shop)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
