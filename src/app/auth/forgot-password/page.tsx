'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { requestPasswordReset } from '@/features/auth/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import { RoyalEnfieldLogo } from '@/components/RoyalEnfieldLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await requestPasswordReset({ email })
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || 'Request failed')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center">
            <RoyalEnfieldLogo className="w-10 h-10" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary font-[family-name:var(--font-display)]">
            MyGarage
          </span>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border-subtle bg-surface-1 overflow-hidden">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-4"
            >
              <div className="size-14 rounded-full bg-success-muted flex items-center justify-center mx-auto">
                <Mail className="size-6 text-success" />
              </div>
              <div className="text-h3 text-success">Reset Link Sent</div>
              <p className="text-body-sm text-text-secondary max-w-xs mx-auto">
                If an account exists with that email, we have sent instructions to reset your password.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-body-sm text-accent hover:text-accent-hover font-medium transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-1">
                <h2 className="text-h2 text-text-primary">Forgot Password</h2>
                <p className="text-body-sm text-text-secondary">Enter your email to receive a reset link.</p>
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
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Send Reset Link
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
      </motion.div>
    </div>
  )
}
