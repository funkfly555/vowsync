/**
 * VendorDetailPage Component
 * @feature 008-vendor-management
 * @task T037
 *
 * Detailed vendor view with tabbed interface (FR-014, FR-015)
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendor } from '@/hooks/useVendors';
import { VendorModal } from '@/components/vendors/VendorModal';
import { DeleteVendorDialog } from '@/components/vendors/DeleteVendorDialog';
import { ContractStatusBadge } from '@/components/vendors/ContractStatusBadge';
import { PaymentStatusBadge } from '@/components/vendors/PaymentStatusBadge';
import { VendorOverviewTab } from '@/components/vendors/VendorOverviewTab';
import { VendorContractTabView } from '@/components/vendors/VendorContractTabView';
import { PaymentsTab } from '@/components/vendors/PaymentsTab';
import { InvoicesTab } from '@/components/vendors/InvoicesTab';
import { VENDOR_TYPE_CONFIG } from '@/types/vendor';

export function VendorDetailPage() {
  const { weddingId, vendorId } = useParams<{ weddingId: string; vendorId: string }>();
  const navigate = useNavigate();
  const { vendor, isLoading, isError, error } = useVendor(vendorId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBack = () => {
    navigate(`/weddings/${weddingId}/vendors`);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    navigate(`/weddings/${weddingId}/vendors`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-100 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isError ? 'Error loading vendor' : 'Vendor not found'}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {error?.message || 'The vendor you are looking for does not exist.'}
        </p>
        <Button onClick={handleBack}>Back to Vendors</Button>
      </div>
    );
  }

  const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.company_name}</h1>
              <ContractStatusBadge status={vendor.contractStatus} />
              <PaymentStatusBadge status={vendor.paymentStatus} />
            </div>
            <p className="text-sm text-gray-500">
              {typeConfig.label} • {vendor.contact_name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <VendorOverviewTab vendor={vendor} vendorId={vendorId || ''} />
        </TabsContent>

        <TabsContent value="contract" className="mt-6">
          <VendorContractTabView vendor={vendor} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentsTab vendorId={vendorId || ''} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesTab vendorId={vendorId || ''} />
        </TabsContent>
      </Tabs>

      {/* Edit modal */}
      <VendorModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        vendor={vendor}
        weddingId={weddingId || ''}
      />

      {/* Delete confirmation dialog */}
      <DeleteVendorDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        vendor={vendor}
      />
    </div>
  );
}
