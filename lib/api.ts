import demoData from '../utils/dreamOutput.json';
import { supabase } from './supabaseClient';

export type AgentStatus = {
  name: string;
  status: 'idle' | 'queued' | 'running' | 'done' | 'error';
  progress: number; // 0..100
  note?: string;
  updatedAt?: string;
};

export type StartResponse = {
  jobId: string;
  agents: AgentStatus[];
};

export type StartAnalysisPayload = FormData | Record<string, unknown>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function startAnalysis(payload: StartAnalysisPayload): Promise<StartResponse> {
  if (!API_BASE) {
    // Demo fallback
    return {
      jobId: Math.random().toString(36).slice(2),
      agents: demoData.agents.map(agent => ({
        ...agent,
        status: 'queued' as const,
        progress: 0
      }))
    }
  }
  const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
  const res = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    body: isForm ? (payload as FormData) : JSON.stringify(payload),
    headers: isForm ? undefined : { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Failed to start analysis: ${res.status} ${res.statusText}`);
  return res.json();
}

// Poll job status from server when available; otherwise simulate progress locally
export async function getJobStatus(jobId: string): Promise<AgentStatus[]> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/status/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job status');
    return res.json();
  }

  // Demo simulation based on elapsed time
  const agentNames: string[] = (demoData as any)?.agents?.map((a: any) => a.name) || [
    'Market Fit Agent',
    'Financials Agent',
    'Tech Diligence Agent'
  ];

  const startKey = `job-start-${jobId}`;
  let startedAt = Number(localStorage.getItem(startKey));
  if (!startedAt) {
    startedAt = Date.now();
    localStorage.setItem(startKey, String(startedAt));
  }
  const elapsed = Date.now() - startedAt;
  const totalMs = 15000; // complete in ~15s

  const statuses: AgentStatus[] = agentNames.map((name, index) => {
    const phaseDelay = index * 1200; // stagger each agent
    const progressRatio = Math.max(0, Math.min(1, (elapsed - phaseDelay) / totalMs));
    const progress = Math.round(progressRatio * 100);
    const done = progress >= 100;
    return {
      name,
      status: done ? 'done' : 'running',
      progress: done ? 100 : Math.max(0, progress),
      note: done ? 'Complete' : 'Analyzing uploaded materials'
    };
  });

  return statuses;
}

export type Insight = {
  title: string;
  summary: string;
  score?: number | string;
}

export type Results = {
  mainKpi: { label: string; value: string | number; context?: string };
  insights: Insight[];
  flag_summary?: Array<{ green_flags?: string[]; red_flags?: string[] }>;
  Deep_dive?: Array<{ title: string; summary: string }>;
  reportUrl?: string; // optional PDF link served by backend
};

// Settings JSON shape stored in Supabase
export type SettingsJson = {
  analysis_agents: {
    market_fit: boolean;
    financials: boolean;
    tech: boolean;
    legal: boolean;
  };
  general: {
    interface_language: string; // e.g. "English (US)"
    target_risk_profile: string; // e.g. "Balanced"
  };
};

// Helpers to provide a sane default
const DEFAULT_SETTINGS_JSON: SettingsJson = {
  analysis_agents: { market_fit: true, financials: true, tech: true, legal: false },
  general: { interface_language: 'English (US)', target_risk_profile: 'Balanced' }
};
export async function getResults(jobId: string): Promise<Results> {
  // Prefer Supabase for results; fall back to API if provided; finally demo data
  if (supabase) {
    const tryTables = ['results', 'Results'] as const;
    const idNum = Number(jobId);

    for (const tableName of tryTables) {
      // Try by id if numeric
      if (Number.isFinite(idNum)) {
        const byId = await supabase
          .from(tableName)
          .select('data')
          .eq('id', idNum)
          .maybeSingle();
        if (!byId.error && byId.data?.data) {
          return byId.data.data as Results;
        }
      }

      // Try by report_id (uuid string)
      const byReportId = await supabase
        .from(tableName)
        .select('data')
        .eq('report_id', jobId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!byReportId.error && byReportId.data?.data) {
        return byReportId.data.data as Results;
      }

      // Fallback to latest row
      const latest = await supabase
        .from(tableName)
        .select('data, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!latest.error && latest.data?.data) {
        return latest.data.data as Results;
      }
    }
  }

  if (API_BASE) {
    const res = await fetch(`${API_BASE}/results/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  }

  // Final fallback to demo
  return demoData;
}

export function getReportPdfUrl(jobId: string): string {
  if (!API_BASE) return '/demo/report.pdf';
  return `${API_BASE}/report/${jobId}.pdf`;
}

// ----------------------------
// Reports listing for user
// ----------------------------

export type ReportMeta = {
  id: number;
  created_at: string;
  report_id?: string | null;
};

/**
 * List reports for a given user, newest first.
 * If user scoping is not available in the DB schema, falls back to all reports.
 */
export async function listReportsForUser(userId: string): Promise<ReportMeta[]> {
  if (!supabase) {
    // Demo mode: single pseudo report
    return [
      { id: 0, created_at: new Date().toISOString(), report_id: 'demo' }
    ];
  }

  const tryTables = ['results', 'Results'] as const;
  const selectCols = 'id, created_at, report_id';

  for (const tableName of tryTables) {
    // Try filtering by user_id
    let q = supabase.from(tableName).select(selectCols).order('created_at', { ascending: false });

    // Attempt to apply user filters; if column does not exist, the request will error
    let byUser = await q.eq('user_id', userId);
    if (!byUser.error) {
      return (byUser.data || []) as ReportMeta[];
    }

    // Try alternative column name userId
    q = supabase.from(tableName).select(selectCols).order('created_at', { ascending: false });
    byUser = await q.eq('userId', userId);
    if (!byUser.error) {
      return (byUser.data || []) as ReportMeta[];
    }

    // Fallback to no filter
    const allRes = await supabase
      .from(tableName)
      .select(selectCols)
      .order('created_at', { ascending: false });
    if (!allRes.error && allRes.data) return allRes.data as ReportMeta[];
  }

  return [];
}

// ----------------------------
// Supabase Storage - Uploads
// ----------------------------

export type UploadedFile = {
  name: string;
  path: string;
  publicUrl?: string;
};

export type UploadFilesResult = {
  success: boolean;
  bucket: string;
  prefix: string;
  files: UploadedFile[];
  errors?: Array<{ name: string; message: string }>;
};

function slugifyFilename(name: string): string {
  const [base, ...extParts] = name.split('.');
  const ext = extParts.length ? `.${extParts.pop()}` : '';
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return `${safeBase || 'file'}${ext}`;
}

export async function uploadFilesToStorage(
  files: File[],
  opts?: { bucket?: string; prefix?: string }
): Promise<UploadFilesResult> {
  if (!supabase) {
    return {
      success: false,
      bucket: opts?.bucket || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'uploads',
      prefix: opts?.prefix || '',
      files: [],
      errors: [{ name: 'all', message: 'Supabase is not configured (missing env vars).' }]
    };
  }

  const bucket = opts?.bucket || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'uploads';
  // For demo/anonymous uploads, place files directly under `anonymous/` with no extra folder
  // If a caller passes an explicit prefix, we respect it (e.g., future user-specific paths)
  const uniquePrefix = opts?.prefix || 'anonymous';

  const results: UploadedFile[] = [];
  const errors: Array<{ name: string; message: string }> = [];

  await Promise.all(
    files.map(async (file) => {
      const safeName = slugifyFilename(file.name);
      const path = `${uniquePrefix}/${safeName}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });

      if (error) {
        errors.push({ name: file.name, message: error.message });
        return;
      }

      // Attempt to create a public URL (works if bucket is public)
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      results.push({ name: file.name, path, publicUrl: pub?.publicUrl });
    })
  );

  return {
    success: errors.length === 0 && results.length > 0,
    bucket,
    prefix: uniquePrefix,
    files: results,
    errors: errors.length ? errors : undefined
  };
}

export type SaveSettingsRequest = {
  userId?: string; // optional user identifier
  language: 'en' | 'de' | 'fr';
  riskProfile: 'low' | 'medium' | 'high';
  agents: { marketFit: boolean; financials: boolean; tech: boolean; legal: boolean };
};

export type SaveSettingsResponse = {
  success: boolean;
  message?: string;
};

// Load settings JSON from Supabase `Settings` table.
// By default we use row id 1 to keep things simple while no auth is wired.
export async function loadSettings(): Promise<SettingsJson | null> {
  if (!supabase) return null;
  const tryTables = ['settings', 'Settings'] as const;

  for (const tableName of tryTables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('personal_settings, analyse_settings, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      const analysis_agents = (data.analyse_settings as SettingsJson['analysis_agents']) || DEFAULT_SETTINGS_JSON.analysis_agents;
      const general = (data.personal_settings as SettingsJson['general']) || DEFAULT_SETTINGS_JSON.general;
      return { analysis_agents, general };
    }
  }
  return null;
}

// Save settings by splitting the JSON into the two columns we have in Supabase
export async function saveSettings(settings: SaveSettingsRequest): Promise<SaveSettingsResponse> {
  // Translate from UI shape to storage JSON shape
  const settingsJson: SettingsJson = {
    analysis_agents: {
      market_fit: settings.agents.marketFit,
      financials: settings.agents.financials,
      tech: settings.agents.tech,
      legal: settings.agents.legal
    },
    general: {
      interface_language:
        settings.language === 'en' ? 'English (US)' : settings.language === 'de' ? 'German' : 'French',
      target_risk_profile:
        settings.riskProfile === 'low' ? 'Low' : settings.riskProfile === 'high' ? 'High' : 'Balanced'
    }
  };

  if (supabase) {
    // Update the latest row; if none exists, insert a new one
    for (const tableName of ['settings', 'Settings']) {
      // Fetch latest row id
      const latest = await supabase
        .from(tableName)
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest.error && latest.data?.id != null) {
        const { error: updErr } = await supabase
          .from(tableName)
          .update({
            personal_settings: settingsJson.general,
            analyse_settings: settingsJson.analysis_agents
          })
          .eq('id', latest.data.id);
        if (!updErr) return { success: true };
        if (updErr && !/not exist|schema cache/i.test(updErr.message)) {
          return { success: false, message: updErr.message };
        }
      }

      // No rows yet, insert one
      const { error: insErr } = await supabase
        .from(tableName)
        .insert({
          personal_settings: settingsJson.general,
          analyse_settings: settingsJson.analysis_agents
        });
      if (!insErr) return { success: true };
      if (insErr && !/not exist|schema cache/i.test(insErr.message)) {
        return { success: false, message: insErr.message };
      }
    }
    return { success: false, message: 'Settings table not found' };
  }

  // As a last resort, if Supabase isn't configured but an API base exists, call it
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsJson)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  }

  // Fallback success in full-demo mode
  return { success: true, message: 'Settings saved (demo mode)' };
}
