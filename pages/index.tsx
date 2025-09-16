import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import Dropzone from '@/components/Dropzone'
import ContextField from '@/components/ContextField'
import StartButton from '@/components/StartButton'
import AgentStatusCard from '@/components/AgentStatusCard'
import { startAnalysis, getJobStatus, AgentStatus } from '@/lib/api'
import { useRouter } from 'next/router'
import { SparklesIcon, DocumentTextIcon, CpuChipIcon } from '@heroicons/react/24/outline'

export default function InputPage(){
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [context, setContext] = useState('')
  const [jobId, setJobId] = useState<string>('')
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [starting, setStarting] = useState(false)

  // Load saved preferences (from settings page) just to show how to include them in payload
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

  // Poll job status
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
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Investment Analysis Platform
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Upload your startup documents and let our AI agents provide comprehensive investment analysis
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900">Document Analysis</h3>
            <p className="text-sm text-neutral-600 mt-1">Upload pitch decks, financials, and business plans</p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                <SparklesIcon className="h-6 w-6 text-accent-600" />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900">AI-Powered Insights</h3>
            <p className="text-sm text-neutral-600 mt-1">Get detailed analysis from specialized AI agents</p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
                <CpuChipIcon className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900">Comprehensive Reports</h3>
            <p className="text-sm text-neutral-600 mt-1">Receive detailed investment recommendations</p>
          </div>
        </div>
      </div>

      {/* Main Input Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-slide-in">
          <Dropzone onFiles={setFiles} />
        </div>
        <div className="animate-slide-in" style={{animationDelay: '200ms'}}>
          <ContextField value={context} onChange={setContext} />
        </div>
      </div>

      {/* Start Analysis Section */}
      <div className="my-8 text-center animate-fade-in" style={{animationDelay: '400ms'}}>
        <div className="max-w-md mx-auto">
          <StartButton
            onClick={handleStart}
            disabled={starting || !canStart}
          />
          {!canStart && (
            <p className="text-sm text-neutral-500 mt-3">
              Upload documents or provide context to start analysis
            </p>
          )}
        </div>
      </div>

      {/* Agent Status Section */}
      {agents.length > 0 && (
        <div className="animate-fade-in" style={{animationDelay: '600ms'}}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Progress</h2>
            <p className="text-neutral-600">Our AI agents are analyzing your documents</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(a => (
              <AgentStatusCard key={a.name} agent={a} />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {agents.length === 0 && !starting && (
        <div className="text-center py-12 animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to Analyze</h3>
            <p className="text-neutral-600">
              Configure your analysis agents in Settings, then upload your documents to begin
            </p>
          </div>
        </div>
      )}
    </Layout>
  )
}
