import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

// ---- Types ----
export type VCSettings = {
  personName: string
  role: string
  firmName: string
  fundName: string
  fundNumber: string
  fundVintage: string
  fundSizeEUR: string
  sfdr: 'None' | 'Article 6' | 'Article 8' | 'Article 9'
  lpConstraints: string

  stages: string[]
  checkSizeMinEUR: string
  checkSizeMaxEUR: string
  targetOwnershipPct: string
  followOnReservePct: string
  leadPreference: ('Lead' | 'Co-lead' | 'Follow' | 'Solo')[]
  roundInstruments: string[]
  decisionSpeedDays: string

  geoRegions: string[]
  geoCountries: string
  sectors: string[]
  techThemes: string[]
  businessModels: string[]
  revenueModels: string[]
  excludedSectors: string

  mustHaveDocs: string[]
  redLines: string
  esgExclusions: string[]
  topSignals: {
    revenueGrowth: number
    retention: number
    unitEconomics: number
    founderMarketFit: number
    defensibilityIP: number
    gtmEfficiency: number
    regulatoryRisk: number
  }
  boardSeat: 'Required' | 'Preferred' | 'Not needed'
  proRataRights: 'Required' | 'Preferred' | 'Not needed'
  ipSensitivity: 'Low' | 'Medium' | 'High'
  regulatorySensitivity: 'Low' | 'Medium' | 'High'

  preferredCoInvestors: string
  avoidCoInvestors: string
  allowCustomerIntros: boolean
  allowPortfolioIntros: boolean

  valueAddAreas: string[]

  inboundPolicy: ('Warm intros' | 'Cold accepted' | 'Program pipelines' | 'Scout network')[]
  responseSLA: string
  meetingPrefs: ('In-person' | 'Video' | 'Phone')[]
  timezone: string

  outputLanguage: ('English' | 'German' | 'French')[]
  reportDepth: '1-pager' | 'Standard' | 'Deep dive'
  reportFormat: ('PDF' | 'Notion' | 'Slide deck')[]
  updateCadence: 'One-off' | 'Weekly watchlist' | 'Monthly brief'
  alertThresholds: string
}

const DEFAULT_SETTINGS: VCSettings = {
  personName: '',
  role: '',
  firmName: '',
  fundName: '',
  fundNumber: '',
  fundVintage: '',
  fundSizeEUR: '',
  sfdr: 'None',
  lpConstraints: '',

  stages: [],
  checkSizeMinEUR: '',
  checkSizeMaxEUR: '',
  targetOwnershipPct: '',
  followOnReservePct: '',
  leadPreference: [],
  roundInstruments: [],
  decisionSpeedDays: '',

  geoRegions: [],
  geoCountries: '',
  sectors: [],
  techThemes: [],
  businessModels: [],
  revenueModels: [],
  excludedSectors: '',

  mustHaveDocs: [],
  redLines: '',
  esgExclusions: [],
  topSignals: {
    revenueGrowth: 3,
    retention: 3,
    unitEconomics: 3,
    founderMarketFit: 3,
    defensibilityIP: 3,
    gtmEfficiency: 3,
    regulatoryRisk: 3
  },
  boardSeat: 'Preferred',
  proRataRights: 'Preferred',
  ipSensitivity: 'Medium',
  regulatorySensitivity: 'Medium',

  preferredCoInvestors: '',
  avoidCoInvestors: '',
  allowCustomerIntros: true,
  allowPortfolioIntros: true,

  valueAddAreas: [],

  inboundPolicy: ['Warm intros'],
  responseSLA: '5 business days',
  meetingPrefs: ['Video'],
  timezone: 'Europe/Berlin',

  outputLanguage: ['English'],
  reportDepth: 'Standard',
  reportFormat: ['PDF'],
  updateCadence: 'One-off',
  alertThresholds: 'Notify on strong fit (≥80) or when round momentum detected'
}

// ---- Option catalogs ----
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']
const LEAD_PREF = ['Lead', 'Co-lead', 'Follow', 'Solo'] as const
const INSTRUMENTS = ['Equity', 'SAFE', 'Convertible']
const REGIONS = ['DACH', 'France', 'Nordics', 'UK/Ireland', 'Southern Europe', 'CEE', 'Benelux', 'US', 'Rest of World']
const SECTORS = [
  'SaaS','Fintech','HealthTech','Bio/Deep Tech','Climate/Energy','AI/ML','DevTools','Cybersecurity',
  'Industrial/Robotics','Marketplaces','Mobility','PropTech','EdTech','Consumer/Commerce','Gaming'
]
const THEMES = [
  'LLM Apps','AI Infrastructure','Open Source','Vertical SaaS','Hardtech/Robotics','Synthetic Bio',
  'Carbon/CCUS','Energy Storage','Computer Vision','Edge/IoT','Privacy/Trust','Spatial/AR'
]
const BMODELS = ['B2B','B2C','B2B2C','Enterprise','SMB','Developer-first','Marketplace']
const RMODELS = ['Subscription','Usage-based','Transaction','Hardware + SaaS','Licensing']
const MUST_HAVE_DOCS = [
  'Financials (P&L/BS/CF)','MRR/ARR & Cohorts','Unit Economics','Pipeline & Win Rates',
  'Tech Architecture','Security & Compliance','Code/Repo access (read-only)',
  'IP/Patents','GTM Plan','Regulatory/Clinical (if applicable)'
]
const ESG_EXCLUSIONS = ['Fossil expansion','Tobacco','Gambling','Weapons','Adult content','Surveillance tech']
const VALUE_ADD = ['GTM','Hiring','Pricing','Product','Partnerships','Fundraising','Internationalization']
const INBOUND = ['Warm intros','Cold accepted','Program pipelines','Scout network'] as const
const MEETINGS = ['In-person','Video','Phone'] as const
const LANGS = ['English','German','French'] as const
const FORMATS = ['PDF','Notion','Slide deck'] as const

// ---- Small helpers ----
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <label className="text-sm font-medium text-neutral-800">{children}</label>
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out focus:border-neutral-400 focus:bg-neutral-50/50 hover:border-neutral-350 ${props.className || ''}`}
    />
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out focus:border-neutral-400 focus:bg-neutral-50/50 hover:border-neutral-350 resize-none ${props.className || ''}`}
    />
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 rounded border-neutral-300" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function MultiCheck({
  options,
  value,
  onChange,
  columns = 3
}: {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  columns?: 2 | 3 | 4
}) {
  const toggle = (opt: string) =>
    value.includes(opt) ? onChange(value.filter(v => v !== opt)) : onChange([...value, opt])
  const colClass = columns === 4 ? 'sm:grid-cols-4' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-2`}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-lg border px-3 py-2 text-sm transition-all duration-200
            ${value.includes(opt)
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-350'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function RadioRow<T extends string>({
  name,
  options,
  value,
  onChange
}: {
  name: string
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label key={opt} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${value === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-350'}`}>
          <input
            type="radio"
            name={name}
            className="hidden"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

export default function FactsForm(){
  const router = useRouter()
  const [form, setForm] = useState<VCSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('vc-settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        setForm({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch { /* ignore */ }
  }, [])

  // Autosave (debounced-ish)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = setTimeout(() => {
      localStorage.setItem('vc-settings', JSON.stringify(form))
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }, 500)
    return () => clearTimeout(id)
  }, [form])

  const set = <K extends keyof VCSettings>(key: K, val: VCSettings[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS)
  }

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vc-settings', JSON.stringify(form))
    }
    router.push('/')
  }

  return (
    <div className="space-y-10">
      {/* Auto-save indicator */}
      <div className="flex justify-end">
        <div className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${saved 
          ? 'bg-neutral-100 text-neutral-600' 
          : 'bg-neutral-50 text-neutral-500'}`}>
          {saved ? 'Saved' : 'Autosaving…'}
        </div>
      </div>

      {/* Identity & Mandate */}
      <Section title="Identity & Mandate" subtitle="Who you are and any constraints we should respect.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <TextInput placeholder="e.g., Jane Doe" value={form.personName} onChange={e => set('personName', e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <TextInput placeholder="General Partner, Partner, Principal…" value={form.role} onChange={e => set('role', e.target.value)} />
          </div>
          <div>
            <Label>Firm</Label>
            <TextInput placeholder="Your VC firm" value={form.firmName} onChange={e => set('firmName', e.target.value)} />
          </div>
          <div>
            <Label>Fund name / number</Label>
            <TextInput placeholder="Fund II" value={form.fundName} onChange={e => set('fundName', e.target.value)} />
          </div>
          <div>
            <Label>Vintage year</Label>
            <TextInput placeholder="2024" value={form.fundVintage} onChange={e => set('fundVintage', e.target.value)} />
          </div>
          <div>
            <Label>Fund size (€)</Label>
            <TextInput placeholder="150,000,000" value={form.fundSizeEUR} onChange={e => set('fundSizeEUR', e.target.value)} />
          </div>
          <div>
            <Label>SFDR classification</Label>
            <RadioRow
              name="sfdr"
              options={['None','Article 6','Article 8','Article 9']}
              value={form.sfdr}
              onChange={v => set('sfdr', v as VCSettings['sfdr'])}
            />
          </div>
          <div className="sm:col-span-2">
            <Label hint="Anything your LPAs or regulators restrict (geo, sectors, impact requirements…)">LP / regulatory constraints</Label>
            <TextArea placeholder="Describe constraints we must respect…" value={form.lpConstraints} onChange={e => set('lpConstraints', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Scope */}
      <Section title="Investment Scope" subtitle="Where you like to play and your round posture.">
        <div className="grid gap-4">
          <div>
            <Label>Stage focus</Label>
            <MultiCheck options={STAGES} value={form.stages} onChange={v => set('stages', v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Typical check min (€)</Label>
              <TextInput placeholder="e.g., 250,000" value={form.checkSizeMinEUR} onChange={e => set('checkSizeMinEUR', e.target.value)} />
            </div>
            <div>
              <Label>Typical check max (€)</Label>
              <TextInput placeholder="e.g., 2,000,000" value={form.checkSizeMaxEUR} onChange={e => set('checkSizeMaxEUR', e.target.value)} />
            </div>
            <div>
              <Label>Target ownership (%)</Label>
              <TextInput placeholder="e.g., 10" value={form.targetOwnershipPct} onChange={e => set('targetOwnershipPct', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Follow-on reserve (% of fund)</Label>
              <TextInput placeholder="e.g., 50" value={form.followOnReservePct} onChange={e => set('followOnReservePct', e.target.value)} />
            </div>
            <div>
              <Label>Round posture</Label>
              <MultiCheck options={[...LEAD_PREF]} value={form.leadPreference as string[]} onChange={v => set('leadPreference', v as VCSettings['leadPreference'])} columns={2} />
            </div>
            <div>
              <Label>Instruments</Label>
              <MultiCheck options={INSTRUMENTS} value={form.roundInstruments} onChange={v => set('roundInstruments', v)} columns={2} />
            </div>
          </div>
          <div>
            <Label hint="Typical time from first meeting to term sheet">Decision speed (days)</Label>
            <TextInput placeholder="e.g., 21" value={form.decisionSpeedDays} onChange={e => set('decisionSpeedDays', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Focus areas */}
      <Section title="Focus Areas" subtitle="Sectors, themes, geographies and models.">
        <div className="grid gap-4">
          <div>
            <Label>Regions</Label>
            <MultiCheck options={REGIONS} value={form.geoRegions} onChange={v => set('geoRegions', v)} />
          </div>
          <div>
            <Label>Specific countries (comma-separated)</Label>
            <TextInput placeholder="e.g., Germany, France, Switzerland, Austria" value={form.geoCountries} onChange={e => set('geoCountries', e.target.value)} />
          </div>
          <div>
            <Label>Sectors</Label>
            <MultiCheck options={SECTORS} value={form.sectors} onChange={v => set('sectors', v)} />
          </div>
          <div>
            <Label>Tech themes</Label>
            <MultiCheck options={THEMES} value={form.techThemes} onChange={v => set('techThemes', v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Business models</Label>
              <MultiCheck options={BMODELS} value={form.businessModels} onChange={v => set('businessModels', v)} columns={2} />
            </div>
            <div>
              <Label>Revenue models</Label>
              <MultiCheck options={RMODELS} value={form.revenueModels} onChange={v => set('revenueModels', v)} columns={2} />
            </div>
          </div>
          <div>
            <Label>Excluded sectors / situations</Label>
            <TextArea placeholder="Anything you do not want to see (e.g., pure consumer, crypto, hardware-only)…" value={form.excludedSectors} onChange={e => set('excludedSectors', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Diligence preferences */}
      <Section title="Diligence Preferences" subtitle="What matters most when we evaluate a deal for you.">
        <div className="grid gap-4">
          <div>
            <Label>Must-have documents</Label>
            <MultiCheck options={MUST_HAVE_DOCS} value={form.mustHaveDocs} onChange={v => set('mustHaveDocs', v)} columns={2} />
          </div>
          <div>
            <Label>ESG exclusions</Label>
            <MultiCheck options={ESG_EXCLUSIONS} value={form.esgExclusions} onChange={v => set('esgExclusions', v)} columns={3} />
          </div>
          <div>
            <Label>Red lines / instant blockers</Label>
            <TextArea placeholder="e.g., sanction risk, dual-use export controls, founder integrity issues…" value={form.redLines} onChange={e => set('redLines', e.target.value)} />
          </div>

          <div className="grid gap-4 rounded-xl border border-neutral-200 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label hint="0 = not important, 5 = critical">Weight the traction signals you care about</Label>
            </div>
            {([
              ['Revenue growth','revenueGrowth'],
              ['Retention','retention'],
              ['Unit economics','unitEconomics'],
              ['Founder-market fit','founderMarketFit'],
              ['Defensibility/IP','defensibilityIP'],
              ['GTM efficiency','gtmEfficiency'],
              ['Regulatory risk (lower is better)','regulatoryRisk']
            ] as const).map(([label, key]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{form.topSignals[key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={form.topSignals[key]}
                  onChange={e => set('topSignals', { ...form.topSignals, [key]: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Board seat</Label>
              <RadioRow name="board" options={['Required','Preferred','Not needed']} value={form.boardSeat} onChange={v => set('boardSeat', v as VCSettings['boardSeat'])} />
            </div>
            <div>
              <Label>Pro-rata rights</Label>
              <RadioRow name="prorata" options={['Required','Preferred','Not needed']} value={form.proRataRights} onChange={v => set('proRataRights', v as VCSettings['proRataRights'])} />
            </div>
            <div>
              <Label>IP sensitivity</Label>
              <RadioRow name="ip" options={['Low','Medium','High']} value={form.ipSensitivity} onChange={v => set('ipSensitivity', v as VCSettings['ipSensitivity'])} />
            </div>
            <div>
              <Label>Regulatory sensitivity</Label>
              <RadioRow name="reg" options={['Low','Medium','High']} value={form.regulatorySensitivity} onChange={v => set('regulatorySensitivity', v as VCSettings['regulatorySensitivity'])} />
            </div>
          </div>
        </div>
      </Section>

      {/* Co-investing & networks */}
      <Section title="Co-investors & Network">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Preferred co-investors (comma-separated)</Label>
            <TextInput placeholder="e.g., Point Nine, Cherry, Creandum" value={form.preferredCoInvestors} onChange={e => set('preferredCoInvestors', e.target.value)} />
          </div>
          <div>
            <Label>Firms to avoid (comma-separated)</Label>
            <TextInput placeholder="Optional" value={form.avoidCoInvestors} onChange={e => set('avoidCoInvestors', e.target.value)} />
          </div>
          <div className="flex items-center gap-6">
            <Checkbox label="Allow customer intros for diligence" checked={form.allowCustomerIntros} onChange={v => set('allowCustomerIntros', v)} />
            <Checkbox label="Allow portfolio intros to founders" checked={form.allowPortfolioIntros} onChange={v => set('allowPortfolioIntros', v)} />
          </div>
        </div>
      </Section>

      {/* Value-add */}
      <Section title="Where You Add the Most Value">
        <MultiCheck options={VALUE_ADD} value={form.valueAddAreas} onChange={v => set('valueAddAreas', v)} columns={3} />
      </Section>

      {/* Sourcing & comms */}
      <Section title="Sourcing & Communication">
        <div className="grid gap-4">
          <div>
            <Label>Inbound policy</Label>
            <MultiCheck options={[...INBOUND]} value={form.inboundPolicy as string[]} onChange={v => set('inboundPolicy', v as VCSettings['inboundPolicy'])} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Response SLA</Label>
              <TextInput placeholder="e.g., 5 business days" value={form.responseSLA} onChange={e => set('responseSLA', e.target.value)} />
            </div>
            <div>
              <Label>Meeting preferences</Label>
              <MultiCheck options={[...MEETINGS]} value={form.meetingPrefs as string[]} onChange={v => set('meetingPrefs', v as VCSettings['meetingPrefs'])} columns={3} />
            </div>
            <div>
              <Label>Timezone</Label>
              <TextInput placeholder="e.g., Europe/Berlin" value={form.timezone} onChange={e => set('timezone', e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Output preferences */}
      <Section title="Output Preferences" subtitle="How should we package and update our work for you?">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Report depth</Label>
              <RadioRow name="depth" options={['1-pager','Standard','Deep dive']} value={form.reportDepth} onChange={v => set('reportDepth', v as VCSettings['reportDepth'])} />
            </div>
            <div>
              <Label>Language(s)</Label>
              <MultiCheck options={[...LANGS]} value={form.outputLanguage as string[]} onChange={v => set('outputLanguage', v as VCSettings['outputLanguage'])} />
            </div>
            <div>
              <Label>Format(s)</Label>
              <MultiCheck options={[...FORMATS]} value={form.reportFormat as string[]} onChange={v => set('reportFormat', v as VCSettings['reportFormat'])} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Update cadence</Label>
              <RadioRow name="cadence" options={['One-off','Weekly watchlist','Monthly brief']} value={form.updateCadence} onChange={v => set('updateCadence', v as VCSettings['updateCadence'])} />
            </div>
            <div>
              <Label hint="e.g., score ≥80, matching thesis + geo + stage">Alert thresholds</Label>
              <TextInput placeholder="Describe when to ping you…" value={form.alertThresholds} onChange={e => set('alertThresholds', e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Footer actions */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-400"
              onClick={() => {
                const raw = JSON.stringify(form, null, 2)
                // naive preview via alert or console; consumer page may render a dedicated preview
                try { console.log('VC settings preview', raw) } catch {}
                alert('Settings JSON printed to console')
              }}
            >
              Preview JSON
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-700"
              onClick={handleReset}
            >
              Reset to defaults
            </button>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-neutral-800"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  )
}



