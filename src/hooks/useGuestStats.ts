import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { GuestStats } from '@/types/dashboard';

/**
 * Hook to fetch guest statistics for RSVP progress display
 * Uses Supabase count aggregation queries for efficiency
 */
export function useGuestStats(weddingId: string) {
  return useQuery({
    queryKey: ['guestStats', weddingId],
    queryFn: async (): Promise<GuestStats> => {
      // Fetch all counts in parallel for better performance
      const [totalResult, confirmedResult, declinedResult] = await Promise.all([
        supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('wedding_id', weddingId),
        supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('wedding_id', weddingId)
          .eq('invitation_status', 'confirmed'),
        supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('wedding_id', weddingId)
          .eq('invitation_status', 'declined'),
      ]);

      // Check for errors
      if (totalResult.error) throw totalResult.error;
      if (confirmedResult.error) throw confirmedResult.error;
      if (declinedResult.error) throw declinedResult.error;

      const total = totalResult.count ?? 0;
      const confirmed = confirmedResult.count ?? 0;
      const declined = declinedResult.count ?? 0;
      const pending = total - confirmed - declined;
      const responseRate = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;

      return {
        total,
        confirmed,
        declined,
        pending,
        responseRate,
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
