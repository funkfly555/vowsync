import { Outlet, useParams } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileDrawer } from './MobileDrawer';

export function AppLayout() {
  const { weddingId } = useParams<{ weddingId: string }>();

  // If no weddingId, render children without navigation shell
  if (!weddingId) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header */}
      <AppHeader weddingId={weddingId} />

      {/* Desktop sidebar */}
      <AppSidebar weddingId={weddingId} />

      {/* Mobile drawer */}
      <MobileDrawer weddingId={weddingId} />

      {/* Main content area */}
      <main className="pt-16 lg:ml-60">
        <div className="p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
