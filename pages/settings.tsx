import Layout from '@/components/Layout'
import { useEffect, useMemo, useState } from 'react'
import {
  CogIcon,
  LanguageIcon,
  CpuChipIcon,
  CheckCircleIcon,
  GlobeAmericasIcon,
  BanknotesIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { saveSettings, SaveSettingsRequest, loadSettings } from '@/lib/api'

type Prefs = {
  language: 'en' | 'de' | 'fr'
  riskProfile: 'low' | 'medium' | 'high'
  agents: { marketFit: boolean; financials: boolean; tech: boolean; legal: boolean }
}

const DEFAULTS: Prefs = {
  language: 'en',
  riskProfile: 'medium',
  agents: { marketFit: true, financials: true, tech: true, legal: false }
}

const agentOptions: Array<{
  key: keyof Prefs['agents']
  label: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}> = [
  {
    key: 'marketFit',
    label: 'Market Fit',
    description: 'Analyze market opportunity and competitive landscape.',
    icon: GlobeAmericasIcon
  },
  {
    key: 'financials',
    label: 'Financials',
    description: 'Review financial metrics, unit economics, and projections.',
    icon: BanknotesIcon
  },
  {
    key: 'tech',
    label: 'Tech',
    description: 'Evaluate technical architecture, scalability, and team strength.',
    icon: CpuChipIcon
  },
  {
    key: 'legal',
    label: 'Legal',
    description: 'Assess legal and regulatory compliance considerations.',
    icon: ScaleIcon
  }
]

const languageLabels: Record<Prefs['language'], string> = {
  en: 'English (US)',
  de: 'German',
  fr: 'French'
}

const riskProfiles: Array<{
  value: Prefs['riskProfile']
  label: string
  description: string
}> = [
  {
    value: 'low',
    label: 'Low',
    description: 'Prioritise capital preservation and de-risked plays.'
  },
  {
    value: 'medium',
    label: 'Balanced',
    description: 'Blend resilient growth with healthy downside protection.'
  },
  {
    value: 'high',
    label: 'High',
    description: 'Optimise for aggressive growth and higher volatility.'
  }
]

const riskProfileLabels = riskProfiles.reduce<Record<Prefs['riskProfile'], string>>((map, profile) => {
  map[profile.value] = profile.label
  return map
}, { low: 'Low', medium: 'Balanced', high: 'High' })

export default function SettingsPage(){
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [initialPrefs, setInitialPrefs] = useState<Prefs>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    let mounted = true
    const hydrate = async () => {
      try {
        // Prefer Supabase
        const remote = await loadSettings()
        if (remote && mounted) {
          const mapped: Prefs = {
            language: remote.general.interface_language === 'German' ? 'de' : remote.general.interface_language === 'French' ? 'fr' : 'en',
            riskProfile: remote.general.target_risk_profile === 'Low' ? 'low' : remote.general.target_risk_profile === 'High' ? 'high' : 'medium',
            agents: {
              marketFit: !!remote.analysis_agents.market_fit,
              financials: !!remote.analysis_agents.financials,
              tech: !!remote.analysis_agents.tech,
              legal: !!remote.analysis_agents.legal
            }
          }
          setPrefs({ ...DEFAULTS, ...mapped })
          setInitialPrefs({ ...DEFAULTS, ...mapped })
          // Mirror to localStorage as a cache
          localStorage.setItem('vc-settings', JSON.stringify(mapped))
          return
        }
      } catch {}

      // Fallback to local cache
      try {
        const raw = JSON.parse(localStorage.getItem('vc-settings') || 'null')
        if (raw && mounted) {
          setPrefs({ ...DEFAULTS, ...raw })
          setInitialPrefs({ ...DEFAULTS, ...raw })
        }
      } catch {}
    }
    hydrate()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // Compare changes against the last loaded baseline (Supabase or local fallback)
    setHasChanges(JSON.stringify(prefs) !== JSON.stringify(initialPrefs))
  }, [prefs, initialPrefs])

  const save = async () => {
    setSaving(true)
    setError(null)

    try {
      // Save to API
      const settingsData: SaveSettingsRequest = {
        language: prefs.language,
        riskProfile: prefs.riskProfile,
        agents: prefs.agents
      }

      const response = await saveSettings(settingsData)

      if (response.success) {
        // Save to localStorage as backup
        localStorage.setItem('vc-settings', JSON.stringify(prefs))
        setInitialPrefs(prefs)
        setSaved(true)
        setHasChanges(false)
        setTimeout(() => setSaved(false), 2000)
      } else {
        throw new Error(response.message || 'Failed to save settings')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      // Still save to localStorage as fallback
      localStorage.setItem('vc-settings', JSON.stringify(prefs))
      setInitialPrefs(prefs)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const selectedAgents = useMemo(() => (
    agentOptions.filter(option => prefs.agents[option.key]).length
  ), [prefs])

  const toggleAgent = (key: keyof Prefs['agents']) => {
    setPrefs(p => ({ ...p, agents: { ...p.agents, [key]: !p.agents[key] } }))
  }

  return (
    <Layout>
      <div className="max-w-5xl space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <CogIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Settings</h1>
              <p className="text-neutral-600">Configure how the analysis agents evaluate your submissions.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Active agents</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">{selectedAgents}</p>
              <p className="text-sm text-neutral-600">of {agentOptions.length} available</p>
            </div>
            <div className="rounded-2xl border border-champagne-200 bg-champagne-50/70 p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-champagne-700">Language</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">{languageLabels[prefs.language]}</p>
              <p className="text-sm text-neutral-600">Controls report output and UI labels</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Risk profile</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">{riskProfileLabels[prefs.riskProfile]}</p>
              <p className="text-sm text-neutral-600">Guides how assertive recommendations should be</p>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <CpuChipIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Analysis Agents</h2>
                  <p className="text-sm text-neutral-600">Choose which AI specialists contribute to each run.</p>
                </div>
              </div>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {selectedAgents} active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {agentOptions.map(({ key, label, description, icon: Icon }) => {
                const enabled = prefs.agents[key]
                return (
                  <label
                    key={key}
                    className={`group flex cursor-pointer gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                      enabled
                        ? 'border-primary-200 bg-primary-50/70 shadow-soft'
                        : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleAgent(key)}
                      className="sr-only"
                    />
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      enabled ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-400 group-hover:text-primary-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900">{label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{description}</p>
                    </div>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      enabled ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="card">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <LanguageIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">General</h2>
                <p className="text-sm text-neutral-600">Language and risk targeting preferences.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Interface language
                </label>
                <select
                  className="input w-full"
                  value={prefs.language}
                  onChange={(e)=>setPrefs(p=>({...p, language: e.target.value as Prefs['language']}))}
                >
                  <option value="en">English (US)</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                </select>
                <p className="mt-1 text-sm text-neutral-500">
                  Impacts report output as well as on-screen copy.
                </p>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-neutral-900">Target risk profile</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {riskProfiles.map(({ value, label, description }) => {
                    const active = prefs.riskProfile === value
                    return (
                      <label
                        key={value}
                        className={`group flex cursor-pointer flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? 'border-primary-200 bg-primary-50/70 shadow-soft'
                            : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="risk-profile"
                          value={value}
                          checked={active}
                          onChange={() => setPrefs(p => ({ ...p, riskProfile: value }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold text-neutral-900">{label}</span>
                        <span className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  Determines how assertive the recommendations and diligence depth should be.
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <button
                  onClick={save}
                  disabled={!hasChanges || saving}
                  className={`btn w-full ${
                    saved
                      ? 'btn-success'
                      : hasChanges && !saving
                        ? 'btn-primary'
                        : 'btn-secondary opacity-60 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </div>
                  ) : saved ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Preferences saved</span>
                    </div>
                  ) : (
                    'Save preferences'
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
