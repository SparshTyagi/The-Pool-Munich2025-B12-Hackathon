import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

type StartButtonProps = {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export default function StartButton({ onClick, disabled, loading, className }: StartButtonProps){
  const isDisabled = Boolean(disabled || loading)

  return (
    <button
      className={`btn btn-primary text-lg font-semibold px-8 py-4 ${
        isDisabled ? 'opacity-80' : 'hover:scale-[1.02]'
      } ${className ?? ''}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
    >
      <div className="flex items-center gap-3">
        {loading ? (
          <>
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            <span>Starting Analysis...</span>
          </>
        ) : (
          <>
            <PlayIcon className="h-6 w-6" />
            <span>Start Analysis</span>
          </>
        )}
      </div>
    </button>
  )
}
