import { cn } from '@/lib/utils';

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerOverlay({ isOpen, onClose }: DrawerOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
