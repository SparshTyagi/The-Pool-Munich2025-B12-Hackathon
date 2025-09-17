import { Insight } from '@/lib/api'
import { LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

type InsightCardProps = {
  insight: Insight
  index?: number
  colorTheme?: 'primary' | 'accent' | 'secondary' | 'champagne'
}

export default function InsightCard({ insight, index, colorTheme = 'primary' }: InsightCardProps){
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

  const badgeLabel = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null

  const colorThemes = {
    primary: { bg: 'bg-primary-100', hoverBg: 'group-hover:bg-primary-200', text: 'text-primary-600' },
    champagne: { bg: 'bg-champagne-100', hoverBg: 'group-hover:bg-champagne-200', text: 'text-champagne-600' },
    accent: { bg: 'bg-primary-100', hoverBg: 'group-hover:bg-primary-200', text: 'text-primary-600' },
    secondary: { bg: 'bg-primary-100', hoverBg: 'group-hover:bg-primary-200', text: 'text-primary-600' }
  }

  const theme = colorThemes[colorTheme]

  return (
    <div className="card group transition-all duration-300 hover:shadow-medium flex flex-col h-full">
      {badgeLabel && (
        <div className="absolute right-8 top-8 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
          Insight {badgeLabel}
        </div>
      )}
      <div className="mb-4 flex items-start gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bg} transition-colors duration-200 ${theme.hoverBg}`}>
          <LightBulbIcon className={`h-5 w-5 ${theme.text}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{insight.title}</h3>
        </div>
      </div>

      <p className="mb-4 leading-relaxed text-neutral-700 flex-grow">{insight.summary}</p>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">Confidence Score</span>
        </div>
        {typeof insight.score === 'number' ? (
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getConfidenceBg(insight.score)}`}>
            <div className={`h-2 w-2 rounded-full ${getConfidenceColor(insight.score).replace('text-', 'bg-')}`}></div>
            <span className={`text-sm font-medium ${getConfidenceColor(insight.score)}`}>
              {(insight.score * 100).toFixed(0)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-neutral-100">
            <div className="h-2 w-2 rounded-full bg-neutral-400"></div>
            <span className="text-sm font-medium text-neutral-500">--</span>
          </div>
        )}
      </div>
    </div>
  )
}
