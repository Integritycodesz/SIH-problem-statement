import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-public-key')
  );
};

// Singleton client instance
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Subscribe to realtime price updates across mandis.
 * Triggers when new price records are inserted or updated.
 */
export const subscribeToCommodityPrices = (
  onUpdate: (payload: any) => void
): RealtimeChannel | null => {
  if (!supabase) {
    console.debug('[Supabase Realtime] Not configured; skipping realtime price listener');
    return null;
  }

  const channel = supabase
    .channel('realtime:commodity_prices')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'commodity_prices' },
      (payload) => {
        console.log('[Supabase Realtime] Price update received:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return channel;
};

/**
 * Subscribe to live RFQ negotiation changes for a specific RFQ session.
 */
export const subscribeToRFQSession = (
  rfqId: number,
  onUpdate: (payload: any) => void
): RealtimeChannel | null => {
  if (!supabase) {
    console.debug('[Supabase Realtime] Not configured; skipping realtime RFQ listener');
    return null;
  }

  const channel = supabase
    .channel(`realtime:rfq:${rfqId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rfqs',
        filter: `id=eq.${rfqId}`,
      },
      (payload) => {
        console.log('[Supabase Realtime] RFQ state updated:', payload);
        onUpdate(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rfq_messages',
        filter: `rfq_id=eq.${rfqId}`,
      },
      (payload) => {
        console.log('[Supabase Realtime] New RFQ message:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return channel;
};

/**
 * Subscribe to contract status updates and escrow fund releases.
 */
export const subscribeToContractUpdates = (
  contractId: number,
  onUpdate: (payload: any) => void
): RealtimeChannel | null => {
  if (!supabase) return null;

  const channel = supabase
    .channel(`realtime:contract:${contractId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'contracts',
        filter: `id=eq.${contractId}`,
      },
      (payload) => {
        console.log('[Supabase Realtime] Contract status updated:', payload);
        onUpdate(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'escrow_payments',
        filter: `contract_id=eq.${contractId}`,
      },
      (payload) => {
        console.log('[Supabase Realtime] Escrow payment updated:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return channel;
};

/**
 * Subscribe to 3-Tier dispute status updates.
 */
export const subscribeToDisputes = (
  onUpdate: (payload: any) => void
): RealtimeChannel | null => {
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime:disputes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'disputes',
      },
      (payload) => {
        console.log('[Supabase Realtime] Dispute update received:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return channel;
};
