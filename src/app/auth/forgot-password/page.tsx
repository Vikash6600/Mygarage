'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/features/auth/actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            MyGarage
          </h2>
        </div>
        <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg">
          {success ? (
            <div className="p-6 text-center space-y-4">
              <div className="text-emerald-400 text-lg font-semibold">Reset Link Sent</div>
              <p className="text-sm text-slate-300">
                If an account exists with that email, we have sent instructions to reset your password. (Check console
                logs for the generated reset URL).
              </p>
              <div className="pt-2">
                <Link href="/auth/login" className="text-blue-400 hover:underline text-sm font-medium">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>Enter your email to request a reset link.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                    {error}
                  </div>
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
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Remembered your password?{' '}
                  <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">
                    Log In
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
