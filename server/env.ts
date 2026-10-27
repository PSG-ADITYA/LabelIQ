import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

let envLoaded = false;

export function ensureEnvironmentLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;

  const envLabelIqPath = path.resolve(process.cwd(), '.env.labeliq');
  const standardEnvPath = path.resolve(process.cwd(), '.env');

  function loadFile(filePath: string, sourceName: string): boolean {
    if (!fs.existsSync(filePath)) return false;
    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const parsed = dotenv.parse(rawContent);
      for (const [key, val] of Object.entries(parsed)) {
        if (val && typeof val === 'string' && val.trim().length > 0 && !process.env[key]) {
          process.env[key] = val.trim();
        }
      }
      const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0);
      const hasSupabase = Boolean(
        process.env.SUPABASE_URL &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)
      );
      console.log(`[Security] Loaded ${sourceName}. Gemini Key: ${hasGemini ? 'Present' : 'Not configured'}, Supabase: ${hasSupabase ? 'Configured' : 'Offline / SQLite mode'}`);
      return true;
    } catch (err: any) {
      console.warn(`[Security] Could not parse ${sourceName}:`, err.message);
      return false;
    }
  }

  const loadedLabelIq = loadFile(envLabelIqPath, '.env.labeliq');
  if (!loadedLabelIq) {
    const loadedStandard = loadFile(standardEnvPath, '.env');
    if (!loadedStandard && !process.env.VERCEL) {
      console.log('[Security] No .env.labeliq or .env found. Operating in local OCR & transparent demo mode.');
    }
  }
}

// Auto-run on module import
ensureEnvironmentLoaded();
