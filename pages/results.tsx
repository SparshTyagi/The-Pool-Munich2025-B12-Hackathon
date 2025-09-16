import Layout from '@/components/Layout'
import TopKPI from '@/components/TopKPI'
import InsightCard from '@/components/InsightCard'
import PDFDownloadButton from '@/components/PDFDownloadButton'
import { getReportPdfUrl, getResults } from '@/lib/api'
import { useEffect, useState } from 'react'
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

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            <span className="text-lg text-neutral-600">Loading analysis results...</span>
          </div>
          <div className="w-full max-w-md">
            <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const [main, ...rest] = data.insights || []

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Analysis Results</h1>
            <p className="text-neutral-600 mt-1">Comprehensive investment analysis completed</p>
          </div>
        </div>

        {/* Main KPI Section */}
        <div className="flex justify-center mb-8">
          <div className="animate-fade-in">
            <TopKPI
              label={data.mainKpi?.label || 'Investment Readiness'}
              value={data.mainKpi?.value || 'B+'}
              context={data.mainKpi?.context || 'Strong traction with moderate technical risk'}
            />
          </div>
        </div>
      </div>

      {/* Main Recommendation */}
      {main && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
              <SparklesIcon className="h-5 w-5 text-accent-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Key Recommendation</h2>
          </div>
          <div className="animate-slide-in">
            <InsightCard
              insight={{
                title: main.title || 'Primary Recommendation',
                summary: main.summary || 'Analysis complete with actionable insights',
                score: main.score
              }}
            />
          </div>
        </div>
      )}

      {/* Additional Insights */}
      {rest.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <DocumentTextIcon className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Detailed Insights</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {rest.slice(0, 6).map((ins: any, idx: number) => (
              <div key={idx} className="animate-fade-in" style={{animationDelay: `${idx * 100}ms`}}>
                <InsightCard insight={ins} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Section */}
      <div className="flex justify-center pt-8 border-t border-neutral-200">
        <div className="animate-fade-in">
          <PDFDownloadButton href={data.reportUrl || getReportPdfUrl(String(jobId || 'demo'))} />
        </div>
      </div>
    </Layout>
  )
}
