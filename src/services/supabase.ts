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
 * Sign up a new user with Supabase Auth and metadata.
 */
export const signUpWithSupabase = async (signUpData: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  district: string;
}) => {
  if (!supabase) throw new Error('Supabase client is not configured.');
  
  const { data, error } = await supabase.auth.signUp({
    email: signUpData.email,
    password: signUpData.password,
    options: {
      data: {
        name: signUpData.name,
        phone: signUpData.phone,
        role: signUpData.role,
        district: signUpData.district,
      },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in existing user with email and password via Supabase Auth.
 */
export const signInWithSupabase = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase client is not configured.');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out the currently active Supabase session.
 */
export const signOutSupabase = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.warn('[Supabase Auth] Sign out warning:', error.message);
};

/**
 * Get active Supabase Auth session.
 */
export const getSupabaseSession = async () => {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Supabase Auth] Session fetch error:', error.message);
    return null;
  }
  return session;
};

/**
 * Listen for Supabase Auth state changes.
 */
export const onSupabaseAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  if (!supabase) return { unsubscribe: () => {} };
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
};


export interface SafeSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribe to realtime price updates across mandis.
 * Triggers when new price records are inserted or updated.
 */
export const subscribeToCommodityPrices = (
  onUpdate: (payload: any) => void
): SafeSubscription | null => {
  if (!supabase) {
    console.debug('[Supabase Realtime] Not configured; skipping realtime price listener');
    return null;
  }

  const chName = `prices_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const channel = supabase
    .channel(chName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'commodity_prices' },
      (payload) => {
        console.log('[Supabase Realtime] Price update received:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      try {
        if (supabase && channel) supabase.removeChannel(channel);
      } catch (err) {
        console.debug('Error removing price channel:', err);
      }
    }
  };
};

/**
 * Subscribe to live RFQ negotiation changes for a specific RFQ session.
 */
export const subscribeToRFQSession = (
  rfqId: number,
  onUpdate: (payload: any) => void
): SafeSubscription | null => {
  if (!supabase) {
    console.debug('[Supabase Realtime] Not configured; skipping realtime RFQ listener');
    return null;
  }

  const chName = `rfq_${rfqId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const channel = supabase
    .channel(chName)
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

  return {
    unsubscribe: () => {
      try {
        if (supabase && channel) supabase.removeChannel(channel);
      } catch (err) {
        console.debug('Error removing RFQ channel:', err);
      }
    }
  };
};

/**
 * Subscribe to contract status updates and escrow fund releases.
 */
export const subscribeToContractUpdates = (
  contractId: number,
  onUpdate: (payload: any) => void
): SafeSubscription | null => {
  if (!supabase) return null;

  const chName = `contract_${contractId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const channel = supabase
    .channel(chName)
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

  return {
    unsubscribe: () => {
      try {
        if (supabase && channel) supabase.removeChannel(channel);
      } catch (err) {
        console.debug('Error removing contract channel:', err);
      }
    }
  };
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

/**
 * Subscribe to Reverse RFQ Buyer Demands live feed.
 * Triggers in realtime when processors or institutional buyers post or fulfill demands.
 */
export const subscribeToBuyerDemands = (
  onUpdate: (payload: any) => void
): SafeSubscription | null => {
  if (!supabase) return null;

  const chName = `buyer_demands_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const channel = supabase
    .channel(chName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'buyer_demands',
      },
      (payload) => {
        console.log('[Supabase Realtime] Buyer demand event received:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      try {
        if (supabase && channel) supabase.removeChannel(channel);
      } catch (err) {
        console.debug('Error removing buyer demands channel:', err);
      }
    }
  };
};

