'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { resetPassword } from '@/features/auth/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { RoyalEnfieldLogo } from '@/components/RoyalEnfieldLogo'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await resetPassword({ token, password, confirmPassword })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setError(res.error || 'Password reset failed')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border-subtle bg-surface-1 overflow-hidden">
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 text-center space-y-4"
        >
          <div className="size-14 rounded-full bg-success-muted flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <div className="text-h3 text-success">Password Reset!</div>
          <p className="text-body-sm text-text-secondary">Redirecting you to the login screen...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-1">
            <h2 className="text-h2 text-text-primary">Reset Password</h2>
            <p className="text-body-sm text-text-secondary">Enter your new password below.</p>
          </div>
          <div className="px-6 pb-4 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[var(--radius-md)] bg-danger-muted border border-danger/20 p-3 text-body-sm text-danger"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Reset Password
            </Button>
            <p className="text-caption text-text-tertiary text-center">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center">
            <RoyalEnfieldLogo className="w-10 h-10" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary font-[family-name:var(--font-display)]">
            MyGarage
          </span>
        </div>
        <Suspense fallback={<div className="text-text-tertiary text-center p-8">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
