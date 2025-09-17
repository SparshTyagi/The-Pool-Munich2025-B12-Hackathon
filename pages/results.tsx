import Layout from '@/components/Layout'
import TopKPI from '@/components/TopKPI'
import InsightCard from '@/components/InsightCard'
import PDFDownloadButton from '@/components/PDFDownloadButton'
import { getReportPdfUrl, getResults } from '@/lib/api'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeftIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function ResultsPage(){
  const router = useRouter()
  const { jobId } = router.query
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    const id = String(jobId || 'demo')
    getResults(id).then(res => { setData(res); setLoading(false) })
  }, [jobId])

  const insights = data?.insights || []
  const main = insights[0]
  const supportingInsights = insights.slice(1)

  const recommendationSegments = useMemo(() => {
    if (!main?.summary) return []
    return main.summary
      .split(/;|\./)
      .map((part: string) => part.trim())
      .filter(Boolean)
  }, [main])

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            <span className="text-lg text-neutral-600">Loading analysis results...</span>
          </div>
          <div className="w-full max-w-md">
            <div className="h-4 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full w-3/5 animate-pulse rounded-full bg-primary-500"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const readinessLabel = data.mainKpi?.label || 'Investment Readiness'
  const readinessValue = data.mainKpi?.value || 'B+'

  const primaryRecommendation = recommendationSegments[0] || main?.summary || 'Analysis complete'
  const additionalActions = recommendationSegments.slice(1)

  return (
    <Layout>
      <div className="space-y-12">
        <section className="border-b border-neutral-200 pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Analysis Results</h1>
              <p className="mt-1 text-neutral-600">Comprehensive investment analysis completed</p>
            </div>
          </div>
        </section>

        <section>
          <TopKPI
            label={readinessLabel}
            value={readinessValue}
            context={data.mainKpi?.context || 'Strong traction with moderate technical risk'}
            className="mx-auto max-w-3xl"
          />
        </section>

        {main && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Key Recommendation</h2>
            </div>
            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-lg font-semibold text-neutral-900">
                    {primaryRecommendation}
                  </p>
                  {additionalActions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-neutral-800">Supporting actions</p>
                      <ul className="mt-2 space-y-2 text-sm text-neutral-700">
                        {additionalActions.map((item: string, idx: number) => (
                          <li key={`${item}-${idx}`} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400" aria-hidden="true"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 self-start rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                  <span className="h-2 w-2 rounded-full bg-primary-500"></span>
                  {`${readinessLabel}: ${readinessValue}`}
                </div>
              </div>
            </div>
          </section>
        )}

        {supportingInsights.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <DocumentTextIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Detailed Insights</h2>
            </div>
            <p className="max-w-3xl text-sm text-neutral-600">
              Dive deeper into the findings that informed this recommendation. Each card highlights one of the high-impact observations surfaced by the agents.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {supportingInsights.map((ins: any, idx: number) => (
                <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 120}ms` }}>
                  <InsightCard insight={ins} index={idx} colorTheme={idx === 0 ? 'champagne' : 'primary'} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex justify-center border-t border-neutral-200 pt-8">
          <PDFDownloadButton href={data.reportUrl || getReportPdfUrl(String(jobId || 'demo'))} />
        </section>
      </div>
    </Layout>
  )
}
