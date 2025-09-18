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
    <div className="flex items-end justify-between mb-4">
      <label className="text-base font-medium text-neutral-800">{children}</label>
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return (
    <textarea
      rows={5}
      {...props}
      className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out focus:border-neutral-300 focus:bg-neutral-50/50 hover:border-neutral-250 resize-none ${props.className || ''}`}
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
    <div className="space-y-8">
      {/* Auto-save indicator */}
      <div className="flex justify-end">
        <div className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${saved 
          ? 'bg-neutral-100 text-neutral-600' 
          : 'bg-neutral-50 text-neutral-500'}`}>
          {saved ? 'Saved' : 'Autosaving…'}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
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
    </div>
  )
}


