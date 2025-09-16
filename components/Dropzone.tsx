import React, { useCallback, useRef, useState } from 'react'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'

type DropzoneProps = {
  onFiles: (files: File[]) => void
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
    // Reset input value to allow selecting the same file again
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

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          drag
            ? 'border-primary-400 bg-primary-50 scale-105 shadow-glow'
            : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-medium'
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Upload pitch deck and materials"
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={onPick} />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="flex h-full items-center justify-center">
            <CloudArrowUpIcon className="h-32 w-32 text-primary-500" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            drag ? 'bg-primary-500 scale-110' : 'bg-primary-100'
          }`}>
            <CloudArrowUpIcon className={`h-8 w-8 transition-colors duration-300 ${
              drag ? 'text-white' : 'text-primary-500'
            }`} />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-neutral-900">
            Upload Your Documents
          </h3>
          <p className="text-neutral-600">
            Drag & drop your pitch deck, financials, or other materials here
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            or <span className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer">browse files</span>
          </p>

          {/* File Type Hints */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['PDF', 'DOC', 'PPT', 'XLS'].map((type) => (
              <span
                key={type}
                className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
              >
                .{type.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        {drag && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-500/10 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-6 py-3 shadow-strong">
              <p className="font-semibold text-primary-700">Drop files here</p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="animate-slide-in">
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-neutral-100">
            <h4 className="mb-4 font-semibold text-neutral-900">
              Selected Files ({files.length})
            </h4>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="group flex items-center gap-3 rounded-xl bg-neutral-50 p-3 transition-all duration-200 hover:bg-neutral-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <DocumentIcon className="h-5 w-5 text-primary-600" />
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
                    className="rounded-lg p-1 text-neutral-400 opacity-0 transition-all duration-200 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                    aria-label={`Remove ${file.name}`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
