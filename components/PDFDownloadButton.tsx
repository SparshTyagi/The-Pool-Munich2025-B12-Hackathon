import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

export default function PDFDownloadButton({ href }:{href:string}){
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="btn btn-primary mx-auto block w-max group"
    >
      <div className="flex items-center gap-3">
        <DocumentArrowDownIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
        <span>Download Full Report</span>
      </div>
    </a>
  )
}
