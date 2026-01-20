/**
 * VendorCard Component
 * @feature 008-vendor-management
 * @task T015
 *
 * Card display for individual vendor (FR-002)
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Video,
  UtensilsCrossed,
  Flower2,
  Music,
  Building2,
  Car,
  Users,
  Scissors,
  Package,
  Palette,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { VendorDisplay, VendorType, VENDOR_TYPE_CONFIG } from '@/types/vendor';
import { ContractStatusBadge } from './ContractStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { cn } from '@/lib/utils';

const VENDOR_ICONS: Record<VendorType, React.ComponentType<{ className?: string }>> = {
  Catering: UtensilsCrossed,
  Photography: Camera,
  Videography: Video,
  Flowers: Flower2,
  'Music/DJ': Music,
  Venue: Building2,
  Transportation: Car,
  Officiant: Users,
  'Hair/Makeup': Scissors,
  Rentals: Package,
  Decor: Palette,
  Other: MoreHorizontal,
};

interface VendorCardProps {
  vendor: VendorDisplay;
  weddingId: string;
  onEdit: (vendor: VendorDisplay) => void;
  onDelete: (vendor: VendorDisplay) => void;
}

export function VendorCard({ vendor, weddingId, onEdit, onDelete }: VendorCardProps) {
  const navigate = useNavigate();
  const Icon = VENDOR_ICONS[vendor.vendor_type] || MoreHorizontal;
  // Defensive null check - handle undefined vendor_type gracefully
  const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type] || { label: vendor.vendor_type || 'Unknown', color: 'gray' };

  const handleCardClick = () => {
    navigate(`/weddings/${weddingId}/vendors/${vendor.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(vendor);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(vendor);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'border border-gray-200'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500">{typeConfig.label}</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <ContractStatusBadge status={vendor.contractStatus} />
            <PaymentStatusBadge status={vendor.paymentStatus} />
          </div>
        </div>

        {/* Company name */}
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {vendor.company_name}
        </h3>

        {/* Contact name */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-1">
          {vendor.contact_name}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:text-gray-900"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
