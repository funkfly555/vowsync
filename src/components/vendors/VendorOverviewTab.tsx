/**
 * VendorOverviewTab Component
 * @feature 008-vendor-management
 * @task T035
 *
 * Overview tab for vendor detail page (FR-016)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Building2,
  CreditCard,
} from 'lucide-react';
import { VendorDisplay, VENDOR_TYPE_CONFIG } from '@/types/vendor';

interface VendorOverviewTabProps {
  vendor: VendorDisplay;
}

export function VendorOverviewTab({ vendor }: VendorOverviewTabProps) {
  const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Vendor Type</p>
              <p className="font-medium">{typeConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4" /> {/* Spacer for alignment */}
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium">{vendor.company_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4" />
            <div>
              <p className="text-sm text-gray-500">Contact Name</p>
              <p className="font-medium">{vendor.contact_name}</p>
            </div>
          </div>

          {vendor.contact_email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href={`mailto:${vendor.contact_email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {vendor.contact_email}
                </a>
              </div>
            </div>
          )}

          {vendor.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href={`tel:${vendor.contact_phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {vendor.contact_phone}
                </a>
              </div>
            </div>
          )}

          {vendor.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{vendor.address}</p>
              </div>
            </div>
          )}

          {vendor.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {vendor.website}
                </a>
              </div>
            </div>
          )}

          {vendor.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{vendor.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banking Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor.bank_name && !vendor.account_name && !vendor.account_number ? (
            <p className="text-sm text-gray-500">No banking information provided.</p>
          ) : (
            <div className="space-y-4">
              {vendor.bank_name && (
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{vendor.bank_name}</p>
                </div>
              )}

              {vendor.account_name && (
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-medium">{vendor.account_name}</p>
                </div>
              )}

              {vendor.maskedAccountNumber && (
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium font-mono">{vendor.maskedAccountNumber}</p>
                </div>
              )}

              {vendor.branch_code && (
                <div>
                  <p className="text-sm text-gray-500">Branch Code</p>
                  <p className="font-medium font-mono">{vendor.branch_code}</p>
                </div>
              )}

              {vendor.swift_code && (
                <div>
                  <p className="text-sm text-gray-500">SWIFT Code</p>
                  <p className="font-medium font-mono">{vendor.swift_code}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
