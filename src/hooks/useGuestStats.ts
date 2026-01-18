import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { GuestStats } from '@/types/dashboard';

/**
 * Hook to fetch guest statistics for RSVP progress display
 * Fetches all guests and calculates stats locally for reliability
 * @feature 020-dashboard-settings-fix - All 4 invitation statuses counted
 */
export function useGuestStats(weddingId: string) {
  return useQuery({
    queryKey: ['guestStats', weddingId],
    queryFn: async (): Promise<GuestStats> => {
      // Fetch all guests with relevant fields
      const { data: guests, error } = await supabase
        .from('guests')
        .select('invitation_status, guest_type')
        .eq('wedding_id', weddingId);

      if (error) throw error;

      const guestList = guests ?? [];

      // Calculate guest counts
      const total = guestList.length;
      const adults = guestList.filter(
        (g) => g.guest_type === 'adult' || g.guest_type === null
      ).length;
      const children = guestList.filter((g) => g.guest_type === 'child').length;

      // Calculate RSVP stats based on invitation_status
      // All 4 statuses: pending (to be sent), invited (awaiting response), confirmed, declined
      const rsvpNotInvited = guestList.filter(
        (g) => g.invitation_status === 'pending' || !g.invitation_status
      ).length;
      const rsvpInvited = guestList.filter(
        (g) => g.invitation_status === 'invited'
      ).length;
      const rsvpConfirmed = guestList.filter(
        (g) => g.invitation_status === 'confirmed'
      ).length;
      const rsvpDeclined = guestList.filter(
        (g) => g.invitation_status === 'declined'
      ).length;

      // Legacy fields for backwards compatibility
      const confirmed = rsvpConfirmed;
      const declined = rsvpDeclined;
      const pending = total - confirmed - declined;
      const responseRate =
        total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;

      return {
        total,
        confirmed,
        declined,
        pending,
        responseRate,
        adults,
        children,
        rsvpNotInvited,
        rsvpInvited,
        rsvpConfirmed,
        rsvpDeclined,
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
