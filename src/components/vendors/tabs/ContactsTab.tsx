/**
 * ContactsTab - Vendor contacts display (read-only)
 * Shows additional contacts with primary/on-site indicators
 * @feature 028-vendor-card-expandable
 * @task T097-T104
 */

import { Mail, Phone, User, Users, Star, MapPin, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { cn } from '@/lib/utils';

interface ContactsTabProps {
  vendorId: string;
}

export function ContactsTab({ vendorId }: ContactsTabProps) {
  const { contacts, isLoading, isError } = useVendorContacts(vendorId);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Failed to load contacts. Please try again.</p>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h4 className="text-lg font-medium text-gray-900 mb-1">No Additional Contacts</h4>
        <p className="text-gray-500">
          No additional contacts have been added for this vendor.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          The primary contact is shown in the Overview tab.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Contacts are read-only. To edit contacts, visit the vendor's full profile page.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Badges</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{contact.contact_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {contact.contact_role || '—'}
              </TableCell>
              <TableCell>
                {contact.contact_email ? (
                  <a
                    href={`mailto:${contact.contact_email}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {contact.contact_email}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {contact.contact_phone ? (
                  <a
                    href={`tel:${contact.contact_phone}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {contact.contact_phone}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {contact.is_primary && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      <Star className="h-3 w-3" />
                      Primary
                    </span>
                  )}
                  {contact.is_onsite_contact && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        'bg-green-100 text-green-700'
                      )}
                    >
                      <MapPin className="h-3 w-3" />
                      On-site
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
