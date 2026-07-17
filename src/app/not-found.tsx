import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-0 px-4 text-center">
      <div className="space-y-6 max-w-md animate-fade-in-up">
        {/* Large 404 */}
        <div className="relative">
          <span className="text-[120px] md:text-[160px] font-extrabold text-surface-2 leading-none select-none font-[family-name:var(--font-display)]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-16 rounded-full bg-accent-muted flex items-center justify-center">
              <svg className="size-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-h1 text-text-primary">Page not found</h1>
          <p className="text-body text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-accent text-[oklch(0.15_0.005_60)] text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-surface-2 text-text-primary text-sm font-medium border border-border-default hover:bg-surface-3 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
