import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
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
import { LoginPage } from './pages/LoginPage';

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
                <Route path="/weddings/:weddingId/guests" element={<GuestListPage />} />
                <Route path="/weddings/:weddingId/vendors" element={<VendorsPage />} />
                <Route path="/weddings/:weddingId/vendors/:vendorId" element={<VendorDetailPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
