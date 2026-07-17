'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-0 px-4 text-center">
      <div className="space-y-6 max-w-md animate-fade-in-up">
        <div className="size-16 rounded-full bg-danger-muted flex items-center justify-center mx-auto">
          <svg className="size-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-h1 text-text-primary">Something went wrong</h1>
          <p className="text-body text-text-secondary">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-accent text-[oklch(0.15_0.005_60)] text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
