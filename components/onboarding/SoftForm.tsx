import { useEffect, useState } from 'react'

type SoftForm = {
  investmentPhilosophy: string
  founderView: string
  marketView: string
  diligenceFocus: string
  collaborationStyle: string
  additionalNotes: string
}

const DEFAULT_SOFT: SoftForm = {
  investmentPhilosophy: '',
  founderView: '',
  marketView: '',
  diligenceFocus: '',
  collaborationStyle: '',
  additionalNotes: ''
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }){
  return (
    <div className="flex items-end justify-between">
      <label className="text-sm font-medium text-neutral-800">{children}</label>
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return (
    <textarea
      rows={5}
      {...props}
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${props.className || ''}`}
    />
  )
}

export default function SoftForm(){
  const [form, setForm] = useState<SoftForm>(DEFAULT_SOFT)
  const [saved, setSaved] = useState(false)

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('vc-settings-soft')
      if (raw) setForm({ ...DEFAULT_SOFT, ...JSON.parse(raw) })
    } catch {}
  }, [])

  // Autosave (debounced-ish)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = setTimeout(() => {
      localStorage.setItem('vc-settings-soft', JSON.stringify(form))
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }, 500)
    return () => clearTimeout(id)
  }, [form])

  const set = <K extends keyof SoftForm>(key: K, val: SoftForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-2 text-right text-xs text-neutral-500">{saved ? 'Saved' : 'Autosaving…'}</div>
      <div className="grid gap-6">
        <div>
          <Label hint="Why you invest the way you do; what great looks like to you">Investment philosophy</Label>
          <TextArea
            placeholder="Describe your overall investing philosophy, portfolio construction ideas, and what you optimize for…"
            value={form.investmentPhilosophy}
            onChange={e => set('investmentPhilosophy', e.target.value)}
          />
        </div>

        <div>
          <Label hint="Team attributes you value; founder-market fit; culture">How you evaluate founding teams</Label>
          <TextArea
            placeholder="What founder qualities matter to you? How do you weigh experience vs. insight, grit, ethics, team dynamics…"
            value={form.founderView}
            onChange={e => set('founderView', e.target.value)}
          />
        </div>

        <div>
          <Label hint="Market structure, timing, competitive dynamics, pricing power">Your view on markets</Label>
          <TextArea
            placeholder="What market characteristics do you look for? How do you assess timing, wedge, defensibility, category creation…"
            value={form.marketView}
            onChange={e => set('marketView', e.target.value)}
          />
        </div>

        <div>
          <Label hint="Signals you trust; red flags; areas to double-click">What you want us to emphasize in diligence</Label>
          <TextArea
            placeholder="Where should our analysis go deeper or be stricter? What red flags to watch, which signals to prioritize…"
            value={form.diligenceFocus}
            onChange={e => set('diligenceFocus', e.target.value)}
          />
        </div>

        <div>
          <Label hint="How you like to collaborate with founders and co-investors">Collaboration style</Label>
          <TextArea
            placeholder="Describe your typical involvement post-investment, cadence, decision-making preferences, and communication style…"
            value={form.collaborationStyle}
            onChange={e => set('collaborationStyle', e.target.value)}
          />
        </div>

        <div>
          <Label>Anything else</Label>
          <TextArea
            placeholder="Any additional context to tailor analysis, sourcing and recommendations for you…"
            value={form.additionalNotes}
            onChange={e => set('additionalNotes', e.target.value)}
          />
        </div>
      </div>
    </section>
  )
}


