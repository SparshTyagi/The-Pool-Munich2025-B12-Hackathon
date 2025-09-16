import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import Dropzone from '@/components/Dropzone'
import ContextField from '@/components/ContextField'
import StartButton from '@/components/StartButton'
import AgentStatusCard from '@/components/AgentStatusCard'
import { startAnalysis, getJobStatus, AgentStatus } from '@/lib/api'
import { useRouter } from 'next/router'
import { SparklesIcon, DocumentTextIcon, CpuChipIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline'

const heroHighlights = [
  {
    title: 'Document Analysis',
    description: 'Upload pitch decks, financials, and business plans',
    icon: DocumentTextIcon,
    iconWrapper: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get detailed analysis from specialized AI agents',
    icon: SparklesIcon,
    iconWrapper: 'bg-accent-100',
    iconColor: 'text-accent-600'
  },
  {
    title: 'Comprehensive Reports',
    description: 'Receive detailed investment recommendations',
    icon: CpuChipIcon,
    iconWrapper: 'bg-success-100',
    iconColor: 'text-success-600'
  }
]

const actionCallouts = [
  {
    title: 'Secure by default',
    description: 'Documents are encrypted in transit and removed after analysis completes.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Fast turnaround',
    description: 'Agents usually deliver a first pass in under three minutes once you submit.',
    icon: ClockIcon
  }
]

export default function InputPage(){
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [context, setContext] = useState('')
  const [jobId, setJobId] = useState<string>('')
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [starting, setStarting] = useState(false)

  const settings = useMemo(()=>{
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('vc-settings') || '{}') } catch { return {} }
  }, [])

  const handleStart = useCallback(async () => {
    setStarting(true)
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    form.append('context', context)
    form.append('preferences', JSON.stringify(settings))
    try {
      const res = await startAnalysis(form)
      setJobId(res.jobId)
      setAgents(res.agents)
    } catch (e) {
      alert('Failed to start analysis. Check console.'); console.error(e)
    } finally {
      setStarting(false)
    }
  }, [files, context, settings])

  useEffect(()=>{
    if (!jobId) return
    const t = setInterval(async ()=>{
      try {
        const s = await getJobStatus(jobId)
        setAgents(s)
        const done = s.every(a => a.status === 'done' || a.progress >= 100)
        if (done) {
          clearInterval(t)
          router.push(`/results?jobId=${jobId}`)
        }
      } catch (e) {
        console.warn('status error', e)
      }
    }, 1500)
    return ()=> clearInterval(t)
  }, [jobId, router])

  const canStart = files.length > 0 || context.trim().length > 0

  return (
    <Layout>
      <section className="mb-12 animate-fade-in">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Investment Analysis Platform
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-neutral-600">
            Upload your startup documents and let our AI agents provide comprehensive investment analysis
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {heroHighlights.map(({ title, description, icon: Icon, iconWrapper, iconColor }) => (
            <div key={title} className="card text-left">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconWrapper}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border-t border-neutral-200 pt-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary-600">Submission</p>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Upload materials and share context</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Provide the documents and narrative your partners need. Combine board decks, financials, product notes, and add any additional color so the agents can tailor their diligence.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {actionCallouts.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-soft">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Icon className="h-5 w-5 text-primary-500" />
                  <span>{title}</span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="animate-slide-in">
            <Dropzone onFiles={setFiles} />
          </div>
          <div className="animate-slide-in" style={{ animationDelay: '120ms' }}>
            <ContextField value={context} onChange={setContext} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StartButton
            onClick={handleStart}
            disabled={!canStart}
            loading={starting}
            className="self-start"
          />
          <p className="text-sm text-neutral-500">
            {canStart
              ? 'Review your inputs before launching the analysis. You can adjust files or context at any time.'
              : 'Upload at least one document or add contextual notes to enable the analysis button.'}
          </p>
        </div>
      </section>

      {agents.length > 0 && (
        <section className="mt-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-neutral-900">Analysis Progress</h2>
            <p className="text-neutral-600">Our AI agents are analyzing your documents</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(a => (
              <AgentStatusCard key={a.name} agent={a} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}
