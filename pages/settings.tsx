import Layout from '@/components/Layout'
import { useEffect, useState } from 'react'
import { CogIcon, LanguageIcon, CpuChipIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type Prefs = {
  language: 'en'|'de'|'fr'
  agents: { marketFit: boolean; financials: boolean; tech: boolean; legal: boolean }
}

const DEFAULTS: Prefs = {
  language: 'en',
  agents: { marketFit: true, financials: true, tech: true, legal: false }
}

const agentDescriptions = {
  marketFit: 'Analyze market opportunity and competitive landscape',
  financials: 'Review financial metrics and projections',
  tech: 'Evaluate technical architecture and scalability',
  legal: 'Assess legal and regulatory compliance'
}

export default function SettingsPage(){
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(()=>{
    try {
      const s = JSON.parse(localStorage.getItem('vc-settings') || 'null')
      if (s) setPrefs(s)
    } catch {}
  }, [])

  useEffect(() => {
    // Check if current prefs differ from saved prefs
    try {
      const saved = JSON.parse(localStorage.getItem('vc-settings') || 'null') || DEFAULTS
      const changed = JSON.stringify(prefs) !== JSON.stringify(saved)
      setHasChanges(changed)
    } catch {
      setHasChanges(true)
    }
  }, [prefs])

  const save = () => {
    localStorage.setItem('vc-settings', JSON.stringify(prefs))
    setSaved(true)
    setHasChanges(false)
    setTimeout(()=>setSaved(false), 2000)
  }

  const formatAgentName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
              <CogIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Settings</h1>
              <p className="text-neutral-600">Configure your analysis preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Analysis Agents */}
          <section className="animate-fade-in">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                  <CpuChipIcon className="h-5 w-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Analysis Agents</h2>
              </div>

              <p className="text-neutral-600 mb-6">
                Select which AI agents you want to include in your analysis. Each agent specializes in different aspects of investment evaluation.
              </p>

              <div className="space-y-4">
                {Object.entries(prefs.agents).map(([key, enabled]) => (
                  <div key={key} className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200">
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e)=>setPrefs(p => ({...p, agents: {...p.agents, [key]: e.target.checked }}))}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-medium text-neutral-900 cursor-pointer">
                        {formatAgentName(key)}
                      </label>
                      <p className="text-sm text-neutral-600 mt-1">
                        {agentDescriptions[key as keyof typeof agentDescriptions]}
                      </p>
                    </div>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      enabled ? 'bg-success-100' : 'bg-neutral-100'
                    }`}>
                      <CheckCircleIcon className={`h-4 w-4 ${
                        enabled ? 'text-success-600' : 'text-neutral-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* General Settings */}
          <section className="animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                  <LanguageIcon className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">General</h2>
              </div>

              <div className="space-y-6">
                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Language
                  </label>
                  <select
                    className="input w-full"
                    value={prefs.language}
                    onChange={(e)=>setPrefs(p=>({...p, language: e.target.value as Prefs['language']}))}
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="fr">🇫🇷 Français</option>
                  </select>
                  <p className="text-sm text-neutral-500 mt-1">
                    Choose your preferred language for the interface and reports.
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-neutral-100">
                  <button
                    onClick={save}
                    disabled={!hasChanges}
                    className={`btn w-full ${
                      saved
                        ? 'btn-success'
                        : hasChanges
                          ? 'btn-primary'
                          : 'btn-secondary opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {saved ? (
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Preferences Saved!</span>
                      </div>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>

                  <div className="flex items-center gap-2 mt-3 text-sm text-neutral-500">
                    <div className="h-2 w-2 rounded-full bg-success-500"></div>
                    <span>Settings are stored locally on your device</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
