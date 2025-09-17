import { Insight } from '@/lib/api'
import { LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

type InsightCardProps = {
  insight: Insight
  index?: number
  colorTheme?: 'primary' | 'champagne'
}

export default function InsightCard({ insight, colorTheme = 'primary' }: InsightCardProps){
  const getAssessmentTextColor = (score?: number) => {
    if (typeof score !== 'number') return 'text-neutral-400'
    if (score >= 0.8) return 'text-success-600'
    if (score >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getAssessmentBackground = (score?: number) => {
    if (typeof score !== 'number') return 'bg-neutral-100'
    if (score >= 0.8) return 'bg-success-50'
    if (score >= 0.6) return 'bg-warning-50'
    return 'bg-error-50'
  }

  const themeStyles = {
    primary: {
      iconWrapper: 'bg-primary-100 group-hover:bg-primary-200',
      iconColor: 'text-primary-600'
    },
    champagne: {
      iconWrapper: 'bg-champagne-100 group-hover:bg-champagne-200',
      iconColor: 'text-champagne-600'
    }
  } as const

  const theme = themeStyles[colorTheme]

  return (
    <div className="card group flex h-full flex-col transition-all duration-300 hover:shadow-medium">
      <div className="mb-4 flex items-start gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${theme.iconWrapper}`}>
          <LightBulbIcon className={`h-5 w-5 ${theme.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{insight.title}</h3>
        </div>
      </div>

      <p className="mb-4 flex-grow leading-relaxed text-neutral-700">{insight.summary}</p>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">Assessment Score</span>
        </div>
        {typeof insight.score === 'number' ? (
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getAssessmentBackground(insight.score)}`}>
            <div className={`h-2 w-2 rounded-full ${getAssessmentTextColor(insight.score).replace('text-', 'bg-')}`}></div>
            <span className={`text-sm font-medium ${getAssessmentTextColor(insight.score)}`}>
              {(insight.score * 100).toFixed(0)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-neutral-400"></div>
            <span className="text-sm font-medium text-neutral-500">--</span>
          </div>
        )}
      </div>
    </div>
  )
}
