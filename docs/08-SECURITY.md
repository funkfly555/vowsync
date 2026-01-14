# Security & Permissions

## Overview

Security is implemented using Supabase Row Level Security (RLS) and authentication.

---

## Authentication

**Provider:** Supabase Auth

**Methods:**
- Email + Password
- Magic Link (optional)
- OAuth (Google, Microsoft) - future

**Session Management:**
- JWT tokens
- Refresh tokens
- Auto-renewal
- Secure cookie storage

---

## Row Level Security (RLS)

### Principle

Users can only access weddings they own, plus all related data (guests, vendors, events, etc.)

### Policy Pattern

```sql
-- Users can view their own weddings
CREATE POLICY "Users can view own weddings"
  ON weddings FOR SELECT
  USING (auth.uid() = consultant_id);

-- Child tables check wedding ownership
CREATE POLICY "Users can view guests of their weddings"
  ON guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

**Applied to all tables:**
- weddings
- events
- guests
- guest_event_attendance
- vendors
- vendor_contacts
- vendor_payment_schedule
- vendor_invoices
- bar_orders
- bar_order_items
- wedding_items
- wedding_item_event_quantities
- repurposing_instructions
- staff_requirements
- shuttle_transport
- stationery_items
- beauty_services
- cottages
- cottage_rooms
- shopping_list_items
- budget_categories
- budget_line_items
- pre_post_wedding_tasks
- attachments
- email_campaigns
- email_logs
- notifications

---

## User Roles

### Consultant (default)
- Full access to their own weddings
- CRUD on all wedding data
- Generate documents
- Send emails

### Admin (super user)
- View all weddings
- Support/troubleshooting access
- System configuration

### Viewer (future)
- Read-only access
- For assistants/team members

---

## File Security

**Supabase Storage:**
- Private buckets
- RLS on storage.objects
- Users can only access files for their weddings
- Signed URLs for temporary access

**Virus Scanning:**
- Recommended: ClamAV or cloud service
- Scan on upload
- Quarantine suspicious files

---

## Data Protection

**Sensitive Data:**
- Passwords: Hashed (bcrypt)
- Credit card info: NEVER stored
- PII: Encrypted at rest (Supabase default)

**GDPR Compliance:**
- Data export capability
- Data deletion (cascade)
- Audit logs (activity_log table)

---

## API Security

**Rate Limiting:**
- Supabase built-in
- 100 requests/10 seconds per user

**CORS:**
- Whitelist specific domains
- No wildcards in production

**Input Validation:**
- Zod schemas on frontend
- PostgreSQL constraints in database
- Sanitize all inputs

---

## Email Security

**Bounce Handling:**
- Hard bounces → mark email invalid
- Soft bounces → retry 3 times

**Spam Prevention:**
- Rate limiting on email sends
- Unsubscribe links (future)

**SPF/DKIM:**
- Configure for sending domain
- Improve deliverability

---

## Best Practices

1. **Never expose sensitive data in URLs**
   - Use POST for sensitive operations
   - IDs are UUIDs (not sequential)

2. **Validate on both client and server**
   - Client: User experience
   - Server: Security

3. **Log security events**
   - Failed logins
   - Permission denials
   - File uploads
   - Bulk operations

4. **Regular updates**
   - Keep Supabase updated
   - Update npm packages
   - Security patches

5. **Backup strategy**
   - Daily automated backups
   - Point-in-time recovery
   - Test restores quarterly

---

**Security Checklist:**
- [x] RLS enabled on all tables
- [x] Strong password requirements
- [x] JWT authentication
- [x] Input validation
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React escaping)
- [x] CSRF prevention (SameSite cookies)
- [x] File upload restrictions
- [x] Rate limiting
- [x] Activity logging

