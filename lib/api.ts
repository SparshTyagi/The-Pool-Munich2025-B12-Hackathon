import demoData from '../utils/demoData.json';

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function startAnalysis(payload: FormData): Promise<StartResponse> {
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
  const res = await fetch(`${API_BASE}/start`, { method: 'POST', body: payload });
  if (!res.ok) throw new Error('Failed to start analysis');
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<AgentStatus[]> {
  if (!API_BASE) {
    // Demo: fake progression
    const now = Date.now();
    const base = (now % 100000) / 1000;
    const progressRates = [17, 14, 10]; // Different rates for each agent
    const progressMods = [110, 120, 130]; // Different modulo values

    return demoData.agents.map((agent, index) => ({
      ...agent,
      status: 'running' as const,
      progress: Math.min(100, Math.floor((base * progressRates[index]) % progressMods[index])),
      updatedAt: new Date().toISOString()
    }));
  }
  const res = await fetch(`${API_BASE}/status/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export type Insight = {
  title: string;
  summary: string;
  score?: number;
}

export type Results = {
  mainKpi: { label: string; value: string | number; context?: string };
  insights: Insight[]; // up to 4 where [0] is main
  reportUrl?: string; // optional PDF link served by backend
};



export async function getResults(jobId: string): Promise<Results> {
  if (!API_BASE) {
    // Demo results
    return demoData;
  }
  const res = await fetch(`${API_BASE}/results/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export function getReportPdfUrl(jobId: string): string {
  if (!API_BASE) return '/demo/report.pdf';
  return `${API_BASE}/report/${jobId}.pdf`;
}
