'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/features/auth/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await registerUser({ name, email, password, confirmPassword })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setError(res.error || 'Registration failed')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Column - Image & Features (Hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="/garage_login_bg.png"
            alt="Garage background"
            className="object-cover w-full h-full filter brightness-75 transition-all duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/40 to-indigo-950/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.8) 100%)" />
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="font-extrabold text-white text-base">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            MyGarage
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage your garage <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                with modern precision.
              </span>
            </h1>
            <p className="text-base text-slate-400 max-w-md">
              A comprehensive portal to track maintenance logs, fuel efficiency, recurring expenses, and crucial documents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
              <span className="text-sm font-semibold text-slate-300">Fuel Analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
              <span className="text-sm font-semibold text-slate-300">Maintenance Logs</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-sm font-semibold text-slate-300">Expense Reports</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-sm font-semibold text-slate-300">Secure Vault</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} MyGarage. All rights reserved.
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        {/* Decorative background ambient glows */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
          <div className="flex flex-col space-y-2 text-left">
            {/* Logo for mobile */}
            <div className="flex items-center space-x-2 lg:hidden mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="font-extrabold text-white text-xs">M</span>
              </div>
              <span className="text-lg font-bold text-white">MyGarage</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Create account</h2>
            <p className="text-sm text-slate-400">
              Sign up to start tracking your vehicles with precision
            </p>
          </div>

          {success ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
              <div className="text-emerald-400 text-lg font-semibold animate-pulse">
                Registration Successful!
              </div>
              <p className="text-sm text-slate-300">
                Redirecting you to the login screen...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-300 font-medium text-xs uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-300 font-medium text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-slate-300 font-medium text-xs uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-slate-300 font-medium text-xs uppercase tracking-wider">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 cursor-pointer transform hover:-translate-y-[1px] active:translate-y-0"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <p className="text-sm text-slate-400 text-center pt-2">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-semibold hover:underline transition-all">
                  Log In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
