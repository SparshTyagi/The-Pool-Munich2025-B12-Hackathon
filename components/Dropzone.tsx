import React, { useCallback, useRef, useState } from 'react'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  ChartBarSquareIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

type DropzoneProps = {
  onFiles: (files: File[]) => void
}

const fileIconMap: Array<{ match: RegExp; icon: React.ComponentType<{ className?: string }> }> = [
  { match: /(ppt|pptx)$/i, icon: PresentationChartLineIcon },
  { match: /(csv|xlsx|xls)$/i, icon: ChartBarSquareIcon },
  { match: /(txt|doc|docx)$/i, icon: DocumentTextIcon },
  { match: /(pdf)$/i, icon: DocumentArrowDownIcon }
]

const getIconForFile = (name: string) => {
  const extension = name.split('.').pop() || ''
  const mapping = fileIconMap.find(entry => entry.match.test(extension))
  return mapping?.icon || DocumentIcon
}

export default function Dropzone({ onFiles }: DropzoneProps){
  const [drag, setDrag] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDrag(false)
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const newFiles = [...files, ...droppedFiles]
    setFiles(newFiles)
    onFiles(newFiles)
  }, [files, onFiles])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(e.target.files || [])
    const newFiles = [...files, ...pickedFiles]
    setFiles(newFiles)
    onFiles(newFiles)
    e.target.value = ''
  }

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove)
    setFiles(newFiles)
    onFiles(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFiles([])
    onFiles([])
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:p-8 ${
          drag
            ? 'border-primary-400 bg-primary-50/80 shadow-glow'
            : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-50/60 hover:shadow-medium'
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Upload pitch deck and materials"
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={onPick} />

        <div className="absolute inset-0 opacity-5">
          <div className="flex h-full items-center justify-center">
            <CloudArrowUpIcon className="h-32 w-32 text-primary-500" />
          </div>
        </div>

        <div className="relative z-10 flex max-w-xl flex-col items-center">
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
            drag ? 'bg-primary-500 text-white shadow-glow' : 'bg-primary-100 text-primary-500'
          }`}>
            <CloudArrowUpIcon className="h-8 w-8" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-neutral-900">
            Upload Your Documents
          </h3>
          <p className="text-neutral-600">
            Drag and drop pitch decks, financials, or other materials here. You can also browse to upload manually.
          </p>
          <p className="mt-3 text-sm font-medium text-primary-600">
            Browse files from your device
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-neutral-600">
            {['PDF', 'DOC', 'PPT', 'XLS'].map((type) => (
              <span
                key={type}
                className="rounded-full bg-neutral-100 px-3 py-1"
              >
                .{type.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {drag && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-500/10 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-6 py-3 shadow-strong">
              <p className="font-semibold text-primary-700">Release to upload your files</p>
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="animate-slide-in">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft">
            <div className="mb-4">
              <h4 className="font-semibold text-neutral-900">
                Selected Files ({files.length})
              </h4>
            </div>
            <div className="space-y-3">
              {files.map((file, index) => {
                const IconComponent = getIconForFile(file.name)
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="group flex items-center gap-3 rounded-xl border border-transparent bg-neutral-50 p-3 transition-all duration-200 hover:border-primary-200 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <IconComponent className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-neutral-900">{file.name}</p>
                      <p className="text-sm text-neutral-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="rounded-lg p-1.5 text-neutral-400 opacity-0 transition-all duration-200 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button onClick={handleClearAll} className="btn btn-ghost">Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
