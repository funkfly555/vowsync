/**
 * ContactsSection Component
 * @feature 009-vendor-payments-invoices
 * T040: Display vendor contacts list with name, role, email, phone
 * T045: Integrated with ContactModal and DeleteContactDialog
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { ContactModal } from './ContactModal';
import { DeleteContactDialog } from './DeleteContactDialog';
import type { VendorContact } from '@/types/vendor';
import {
  User,
  Mail,
  Phone,
  Star,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactsSectionProps {
  vendorId: string;
}

/**
 * Displays vendor contacts with badges for primary and onsite contacts
 * Includes actions for add, edit, and delete (implemented in US9)
 */
export function ContactsSection({ vendorId }: ContactsSectionProps) {
  const { contacts, isLoading, isError } = useVendorContacts(vendorId);

  // State for modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<VendorContact | null>(null);

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  };

  const handleEdit = (contact: VendorContact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDelete = (contact: VendorContact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleContactModalClose = () => {
    setIsContactModalOpen(false);
    setSelectedContact(null);
  };

  const handleContactSuccess = () => {
    setIsContactModalOpen(false);
    setSelectedContact(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedContact(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedContact(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error loading contacts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts
          </CardTitle>
          <CardDescription>
            {contacts.length === 0
              ? 'No contacts added'
              : `${contacts.length} contact${contacts.length > 1 ? 's' : ''}`}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No contacts added yet. Add contacts to track key personnel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.contact_name}</span>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      {contact.is_onsite_contact && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          Onsite
                        </Badge>
                      )}
                    </div>
                    {contact.contact_role && (
                      <p className="text-sm text-muted-foreground">
                        {contact.contact_role}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm">
                      {contact.contact_email && (
                        <a
                          href={`mailto:${contact.contact_email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {contact.contact_email}
                        </a>
                      )}
                      {contact.contact_phone && (
                        <a
                          href={`tel:${contact.contact_phone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {contact.contact_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(contact)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(contact)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal for Add/Edit */}
        <ContactModal
          open={isContactModalOpen}
          onClose={handleContactModalClose}
          onSuccess={handleContactSuccess}
          vendorId={vendorId}
          contact={selectedContact}
        />

        {/* Delete Contact Dialog */}
        <DeleteContactDialog
          open={isDeleteDialogOpen}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          vendorId={vendorId}
          contact={selectedContact}
        />
      </CardContent>
    </Card>
  );
}

export default ContactsSection;
