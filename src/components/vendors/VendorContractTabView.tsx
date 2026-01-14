/**
 * VendorContractTabView Component
 * @feature 008-vendor-management
 * @task T036
 *
 * Contract tab for vendor detail page (FR-017)
 * Read-only display of contract details
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { VendorDisplay, CONTRACT_STATUS_CONFIG } from '@/types/vendor';
import { format } from 'date-fns';

interface VendorContractTabViewProps {
  vendor: VendorDisplay;
}

export function VendorContractTabView({ vendor }: VendorContractTabViewProps) {
  const contractConfig = CONTRACT_STATUS_CONFIG[vendor.contractStatus.label];

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    return format(new Date(dateStr), 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Contract Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Status
            </span>
            <Badge className={`${contractConfig.bgColor} ${contractConfig.color}`}>
              {vendor.contractStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {vendor.contract_signed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="font-medium">
              {vendor.contract_signed ? 'Contract Signed' : 'Contract Not Signed'}
            </span>
          </div>

          {vendor.contract_signed && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contract Date</p>
                  <p className="font-medium">{formatDate(vendor.contract_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{formatDate(vendor.contract_expiry_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contract Value</p>
                  <p className="font-medium">{formatCurrency(vendor.contract_value)}</p>
                </div>
              </div>

              {vendor.cancellation_fee_percentage !== null && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Cancellation Fee</p>
                    <p className="font-medium">{vendor.cancellation_fee_percentage}%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {vendor.cancellation_policy && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-1">Cancellation Policy</p>
              <p className="text-sm">{vendor.cancellation_policy}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor.insurance_required ? (
            <p className="text-sm text-gray-500">Insurance not required for this vendor.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {vendor.insurance_verified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Insurance Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700">Insurance Pending Verification</span>
                  </>
                )}
              </div>

              {vendor.insurance_expiry_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Insurance Expiry Date</p>
                    <p className="font-medium">{formatDate(vendor.insurance_expiry_date)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
