import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AppLayout } from './components/layout/AppLayout';
import { WeddingListPage } from './pages/WeddingListPage';
import { CreateWeddingPage } from './pages/CreateWeddingPage';
import { EditWeddingPage } from './pages/EditWeddingPage';
import { EventTimelinePage } from './pages/EventTimelinePage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { WeddingDashboardPage } from './pages/WeddingDashboardPage';
import { GuestListPage } from './pages/GuestListPage';
import { VendorsPage } from './pages/vendors/VendorsPage';
import { VendorDetailPage } from './pages/vendors/VendorDetailPage';
import { BudgetPage } from './pages/budget/BudgetPage';
import { BarOrdersPage } from './pages/bar-orders/BarOrdersPage';
import { BarOrderDetailPage } from './pages/bar-orders/BarOrderDetailPage';
import { WeddingItemsPage } from './pages/wedding-items/WeddingItemsPage';
import { RepurposingPage } from './pages/RepurposingPage';
import { TasksPage } from './pages/TasksPage';
import { LoginPage } from './pages/LoginPage';
import { EmailTemplatesPage } from './pages/email/EmailTemplatesPage';
import { EmailCampaignsPage } from './pages/email/EmailCampaignsPage';
import { CreateEmailCampaignPage } from './pages/email/CreateEmailCampaignPage';
import { EmailCampaignDetailPage } from './pages/email/EmailCampaignDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActivityPage } from './pages/ActivityPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth pages */}
              <Route path="/login" element={<LoginPage />} />

              {/* Standalone pages (no navigation shell) */}
              <Route path="/" element={<WeddingListPage />} />
              <Route path="/weddings/new" element={<CreateWeddingPage />} />
              <Route path="/weddings/:id/edit" element={<EditWeddingPage />} />

              {/* Wedding pages with navigation shell */}
              <Route element={<AppLayout />}>
                <Route path="/weddings/:weddingId" element={<WeddingDashboardPage />} />
                <Route path="/weddings/:weddingId/events" element={<EventTimelinePage />} />
                <Route path="/weddings/:weddingId/events/new" element={<CreateEventPage />} />
                <Route path="/weddings/:weddingId/events/:eventId/edit" element={<EditEventPage />} />
                <Route path="/weddings/:weddingId/tasks" element={<TasksPage />} />
                <Route path="/weddings/:weddingId/guests" element={<GuestListPage />} />
                <Route path="/weddings/:weddingId/vendors" element={<VendorsPage />} />
                <Route path="/weddings/:weddingId/vendors/:vendorId" element={<VendorDetailPage />} />
                <Route path="/weddings/:weddingId/budget" element={<BudgetPage />} />
                <Route path="/weddings/:weddingId/items" element={<WeddingItemsPage />} />
                <Route path="/weddings/:weddingId/repurposing" element={<RepurposingPage />} />
                <Route path="/weddings/:weddingId/bar-orders" element={<BarOrdersPage />} />
                <Route path="/weddings/:weddingId/bar-orders/:orderId" element={<BarOrderDetailPage />} />
                {/* Email routes - 016-email-campaigns */}
                <Route path="/weddings/:weddingId/emails" element={<EmailCampaignsPage />} />
                <Route path="/weddings/:weddingId/emails/templates" element={<EmailTemplatesPage />} />
                <Route path="/weddings/:weddingId/emails/new" element={<CreateEmailCampaignPage />} />
                <Route path="/weddings/:weddingId/emails/:campaignId" element={<EmailCampaignDetailPage />} />
                {/* Notifications - 018-notifications */}
                <Route path="/weddings/:weddingId/notifications" element={<NotificationsPage />} />
                {/* Documents - 017-document-generation */}
                <Route path="/weddings/:weddingId/docs" element={<DocumentsPage />} />
                {/* Activity Log - 020-dashboard-settings-fix */}
                <Route path="/weddings/:weddingId/activity" element={<ActivityPage />} />
                {/* Settings - 020-dashboard-settings-fix */}
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
