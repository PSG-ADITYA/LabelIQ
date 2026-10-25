/**
 * Supabase Cloud Adapter for LabelIQ Studio
 * Supports dual-mode:
 * 1. Cloud Mode: If SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided, connects to Supabase PostgreSQL.
 * 2. Standalone / Demo Mode: If unconfigured, falls back to local SQLite with zero network overhead.
 */

export interface SupabaseConfig {
  url?: string;
  serviceKey?: string;
  anonKey?: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const rawUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim();
  const url = rawUrl ? rawUrl.replace(/\/+$/, '') : undefined;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  // Configured if URL and either serviceKey or anonKey are present
  const isConfigured = Boolean(url && (serviceKey || anonKey) && url.startsWith('http'));
  return {
    url,
    serviceKey,
    anonKey,
    isConfigured
  };
}

export function logDatabaseMode(): void {
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    const keyType = config.serviceKey ? 'service-role' : 'anon-public';
    console.log(`[Database] Supabase cloud mode configured (auth: ${keyType}). Dual-persistence ready.`);
  } else {
    console.log('[Database] Standalone local SQLite active (WAL mode). Guest demo mode ready without cloud account.');
  }
}

/**
 * Performs a live REST ping to verify Supabase project connectivity
 * without leaking any credentials in logs or responses.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; status?: number }> {
  const config = getSupabaseConfig();
  if (!config.isConfigured || !config.url) {
    return {
      success: false,
      message: 'Supabase is not configured. Missing SUPABASE_URL or API key.'
    };
  }

  const apiKey = config.serviceKey || config.anonKey;
  try {
    const cleanUrl = config.url.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': apiKey || '',
        'Authorization': `Bearer ${apiKey || ''}`
      }
    });

    if (res.ok || res.status === 200 || res.status === 404) {
      return {
        success: true,
        status: res.status,
        message: `Successfully connected to Supabase REST endpoint. HTTP ${res.status} OK.`
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        status: res.status,
        message: 'Reached Supabase endpoint, but the provided API key was rejected (401 Unauthorized).'
      };
    }

    return {
      success: false,
      status: res.status,
      message: `Supabase ping returned HTTP ${res.status}: ${res.statusText}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message}`
    };
  }
}
