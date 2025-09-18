import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import Dropzone from '@/components/Dropzone'
import ContextField from '@/components/ContextField'
import StartButton from '@/components/StartButton'
import AgentStatusCard from '@/components/AgentStatusCard'
import { startAnalysis, getJobStatus, AgentStatus, uploadFilesToStorage } from '@/lib/api'
import { useRouter } from 'next/router'

const isDemoEnvironment = !process.env.NEXT_PUBLIC_API_BASE_URL

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
      // Kick off Supabase storage upload in parallel (non-blocking)
      const uploadTask = files.length > 0
        ? uploadFilesToStorage(files).catch(e => { console.warn('storage upload failed', e) })
        : Promise.resolve(null)

      const res = await startAnalysis(form)
      setJobId(res.jobId)
      const incomingAgents = res.agents ?? []
      const normalizedAgents = isDemoEnvironment
        ? incomingAgents.map((agent, index) => ({
            ...agent,
            status: agent.status === 'queued' ? 'running' : agent.status,
            progress: agent.progress && agent.progress > 0 ? agent.progress : Math.min(90, 30 + index * 20),
            note: agent.note || 'Analyzing uploaded materials'
          }))
        : incomingAgents
      setAgents(normalizedAgents)
      // Ensure any upload error is surfaced to console without blocking UX
      uploadTask?.catch(()=>{})
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

  const baseCanStart = files.length > 0 || context.trim().length > 0
  const canStart = isDemoEnvironment || baseCanStart
  const showDemoPrompt = isDemoEnvironment && !baseCanStart

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
      </section>

      <section className="mt-6 border-t border-neutral-200 pt-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="animate-slide-in">
            <Dropzone onFiles={setFiles} />
          </div>
          <div className="animate-slide-in" style={{ animationDelay: '120ms' }}>
            <ContextField value={context} onChange={setContext} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {!baseCanStart && (
            <p className="text-sm text-neutral-500 text-center">
              Upload at least one document or add contextual notes to enable the analysis button.
            </p>
          )}
          <div className={`flex ${baseCanStart ? 'flex-col gap-3 sm:flex-row sm:items-center sm:justify-center' : 'justify-center'}`}>
            <StartButton
              onClick={handleStart}
              disabled={!canStart}
              loading={starting}
              className=""
            />
            {baseCanStart && (
              <p className="text-sm text-neutral-500">
                Review your inputs before launching the analysis. You can adjust files or context at any time.
              </p>
            )}
          </div>
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

