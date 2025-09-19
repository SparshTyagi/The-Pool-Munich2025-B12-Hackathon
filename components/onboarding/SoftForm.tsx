import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

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

// Collapsible Section (matches FactsForm styling/behavior)
function Section({ 
  title,
  subtitle,
  isOpen,
  onToggle,
  children
}:{
  title: string
  subtitle?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}){
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-primary-200/70 ${isOpen ? 'mb-8' : 'mb-3'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`group flex w-full items-start justify-between gap-3 text-left transition-all duration-200 hover:bg-primary-50/30 ${isOpen ? 'p-6' : 'p-4'}`}
      >
        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold text-neutral-900 transition-all duration-200 ${isOpen ? 'text-xl' : 'text-lg'}`}>{title}</h2>
          {subtitle && (
            <p className={`mt-1 text-neutral-600 transition-all duration-200 ${isOpen ? 'text-sm' : 'text-xs'}`}>{subtitle}</p>
          )}
        </div>
        <ChevronDownIcon className={`flex-shrink-0 text-neutral-500 transition-all duration-200 group-hover:text-primary-600 ${isOpen ? 'rotate-180 h-5 w-5' : 'h-4 w-4'}`} />
      </button>
      {isOpen && (
        <div className="animate-fadeIn grid gap-4 px-6 pb-6">
          {children}
        </div>
      )}
    </section>
  )
}

export default function SoftForm(){
  const [form, setForm] = useState<SoftForm>(DEFAULT_SOFT)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [openSection, setOpenSection] = useState<string>('philosophy')
  const DEMO_USER_ID = '9da0eefb-b471-4b70-99fa-761e8b39c542'

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

  const toggleSection = (id: string) => setOpenSection(curr => curr === id ? '' : id)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (!supabase) {
        alert('Supabase is not configured. Saved locally only (demo).')
        return
      }
      const payload: string[] = [
        form.investmentPhilosophy,
        form.founderView,
        form.marketView,
        form.diligenceFocus,
        form.collaborationStyle,
        form.additionalNotes
      ]
      const { error } = await supabase
        .from('profil')
        .update({ investment_soft: payload })
        .eq('user_id', DEMO_USER_ID)
      if (error) throw error
      alert('Vision & philosophy saved')
    } catch (e: any) {
      console.error(e)
      alert(`Failed to save: ${e?.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex justify-end">
        <div className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${saved 
          ? 'bg-neutral-100 text-neutral-600' 
          : 'bg-neutral-50 text-neutral-500'}`}>
          {saved ? 'Saved' : 'Autosaving…'}
        </div>
      </div>

      {/* Form Sections (Accordion) */}
      <div className="space-y-2">
        <Section
          title="Investment philosophy"
          subtitle="Why you invest the way you do; what great looks like to you"
          isOpen={openSection === 'philosophy'}
          onToggle={() => toggleSection('philosophy')}
        >
          <TextArea
            placeholder="Describe your overall investing philosophy, portfolio construction ideas, and what you optimize for…"
            value={form.investmentPhilosophy}
            onChange={e => set('investmentPhilosophy', e.target.value)}
          />
        </Section>

        <Section
          title="How you evaluate founding teams"
          subtitle="Team attributes you value; founder-market fit; culture"
          isOpen={openSection === 'founders'}
          onToggle={() => toggleSection('founders')}
        >
          <TextArea
            placeholder="What founder qualities matter to you? How do you weigh experience vs. insight, grit, ethics, team dynamics…"
            value={form.founderView}
            onChange={e => set('founderView', e.target.value)}
          />
        </Section>

        <Section
          title="Your view on markets"
          subtitle="Market structure, timing, competitive dynamics, pricing power"
          isOpen={openSection === 'markets'}
          onToggle={() => toggleSection('markets')}
        >
          <TextArea
            placeholder="What market characteristics do you look for? How do you assess timing, wedge, defensibility, category creation…"
            value={form.marketView}
            onChange={e => set('marketView', e.target.value)}
          />
        </Section>

        <Section
          title="What you want us to emphasize in diligence"
          subtitle="Signals you trust; red flags; areas to double-click"
          isOpen={openSection === 'diligence'}
          onToggle={() => toggleSection('diligence')}
        >
          <TextArea
            placeholder="Where should our analysis go deeper or be stricter? What red flags to watch, which signals to prioritize…"
            value={form.diligenceFocus}
            onChange={e => set('diligenceFocus', e.target.value)}
          />
        </Section>

        <Section
          title="Collaboration style"
          subtitle="How you like to collaborate with founders and co-investors"
          isOpen={openSection === 'collaboration'}
          onToggle={() => toggleSection('collaboration')}
        >
          <TextArea
            placeholder="Describe your typical involvement post-investment, cadence, decision-making preferences, and communication style…"
            value={form.collaborationStyle}
            onChange={e => set('collaborationStyle', e.target.value)}
          />
        </Section>

        <Section
          title="Anything else"
          isOpen={openSection === 'other'}
          onToggle={() => toggleSection('other')}
        >
          <TextArea
            placeholder="Any additional context to tailor analysis, sourcing and recommendations for you…"
            value={form.additionalNotes}
            onChange={e => set('additionalNotes', e.target.value)}
          />
        </Section>
      </div>

      {/* Footer action */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 ${isSaving ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800'}`}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}


