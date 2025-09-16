import { AgentStatus } from '@/lib/api'
import { CpuChipIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

function ProgressBar({ value, status }:{value:number, status: AgentStatus['status']}){
  const getProgressColor = () => {
    switch (status) {
      case 'done': return 'bg-success-500'
      case 'running': return 'bg-primary-500'
      case 'error': return 'bg-error-500'
      default: return 'bg-neutral-400'
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-neutral-600">Progress</span>
        <span className="font-medium text-neutral-900">{Math.round(value)}%</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
        {/* Shimmer effect for running status */}
        {status === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        )}
      </div>
    </div>
  )
}

function StatusIcon({ status }:{status: AgentStatus['status']}){
  const iconClasses = "h-5 w-5"

  switch (status) {
    case 'done':
      return <CheckCircleIcon className={`${iconClasses} text-success-500`} />
    case 'running':
      return <CpuChipIcon className={`${iconClasses} text-primary-500 animate-pulse`} />
    case 'error':
      return <ExclamationTriangleIcon className={`${iconClasses} text-error-500`} />
    case 'queued':
      return <ClockIcon className={`${iconClasses} text-warning-500`} />
    default:
      return <ClockIcon className={`${iconClasses} text-neutral-400`} />
  }
}

export default function AgentStatusCard({ agent }:{agent: AgentStatus}){
  const getStatusColor = () => {
    switch (agent.status) {
      case 'done': return 'status-success'
      case 'running': return 'status-info'
      case 'error': return 'status-error'
      case 'queued': return 'status-warning'
      default: return 'status-info'
    }
  }

  const getStatusText = () => {
    switch (agent.status) {
      case 'done': return 'Completed'
      case 'running': return 'Analyzing'
      case 'error': return 'Error'
      case 'queued': return 'Queued'
      case 'idle': return 'Idle'
      default: return agent.status
    }
  }

  return (
    <div className="card w-full animate-fade-in hover:shadow-medium transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <StatusIcon status={agent.status} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{agent.name}</h3>
            <div className={`status-indicator ${getStatusColor()} mt-1`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>

      <ProgressBar value={agent.progress} status={agent.status} />

      {agent.note && (
        <div className="mt-4 rounded-lg bg-neutral-50 p-3">
          <p className="text-sm text-neutral-700">{agent.note}</p>
        </div>
      )}

      {agent.updatedAt && (
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <ClockIcon className="h-4 w-4" />
          <span>Last updated {new Date(agent.updatedAt).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Completion badge */}
      {agent.status === 'done' && agent.progress >= 100 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-success-700">
          <CheckCircleIcon className="h-4 w-4" />
          <span className="font-medium">Analysis Complete</span>
        </div>
      )}
    </div>
  )
}
