# VC Assist – Frontend Skeleton (Next.js + Tailwind)

This is a minimal, production-leaning **frontend-only** starter for a B2B SaaS that assists VCs with pitch‑deck checks via background AI agents.

It includes:
- **Next.js (pages router) + TailwindCSS**
- **Three pages**: Input, Results, Settings
- **Reusable components**: Dropzone, Context field, Start button, Agent status card, Insight card, KPI and PDF button
- **API client** (`lib/api.ts`) to call your backend (set `NEXT_PUBLIC_API_BASE_URL`)
- **Supabase client** (`lib/supabaseClient.ts`) ready if you want to store files in Supabase
- Simple **demo mode** if no backend URL is set

## Quick start

```bash
npm i
cp .env.example .env
# (optional) set NEXT_PUBLIC_API_BASE_URL and Supabase envs
npm run dev
```

Open http://localhost:3000

## Wire-up with your backend

Set `NEXT_PUBLIC_API_BASE_URL` to your server. The client expects these endpoints:

- `POST /start` -> `{ jobId: string, agents: AgentStatus[] }`
  - Accepts a `multipart/form-data` body with `files[]`, `context` and `preferences` (JSON).
- `GET /status/:jobId` -> `AgentStatus[]`
- `GET /results/:jobId` -> `{ mainKpi, insights[], reportUrl? }`
- `GET /report/:jobId.pdf` -> PDF file (used by the "Download report" button).

Until you provide a base URL, the app runs in **demo mode** with mocked status & results.

## Folder structure

```
components/     # UI atoms & molecules
lib/            # api client & supabase client
pages/          # Next.js pages (Input, Results, Settings)
styles/         # Tailwind
```

## Notes

- This is intentionally lightweight: no Redux, no UI kit. Tailwind only.
- Preferences on the Settings page are stored in `localStorage` and included with `/start` calls.
- Replace styles and component copy to match your brand.
