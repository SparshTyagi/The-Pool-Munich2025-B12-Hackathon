import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function StartButton({ onClick, disabled }:{onClick:()=>void, disabled?:boolean}){
  return (
    <div className="flex justify-center">
      <button
        className={`btn btn-primary text-lg font-semibold px-8 py-4 ${
          disabled ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
        }`}
        onClick={onClick}
        disabled={!!disabled}
      >
        <div className="flex items-center gap-3">
          {disabled ? (
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
    </div>
  )
}
