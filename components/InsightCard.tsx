import { Insight } from '@/lib/api'
import { LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function InsightCard({ insight }:{insight: Insight}){
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-neutral-400'
    if (score >= 0.8) return 'text-success-600'
    if (score >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getConfidenceBg = (score?: number) => {
    if (!score) return 'bg-neutral-100'
    if (score >= 0.8) return 'bg-success-50'
    if (score >= 0.6) return 'bg-warning-50'
    return 'bg-error-50'
  }

  return (
    <div className="card group hover:shadow-medium transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 group-hover:bg-primary-200 transition-colors duration-200">
          <LightBulbIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{insight.title}</h3>
        </div>
      </div>

      <p className="text-neutral-700 leading-relaxed mb-4">{insight.summary}</p>

      {typeof insight.score === 'number' && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">Confidence Score</span>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getConfidenceBg(insight.score)}`}>
            <div
              className={`h-2 w-2 rounded-full ${getConfidenceColor(insight.score).replace('text-', 'bg-')}`}
            ></div>
            <span className={`text-sm font-medium ${getConfidenceColor(insight.score)}`}>
              {(insight.score*100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
