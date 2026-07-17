'use client'

import React, { useState, useTransition } from 'react'
import { RoyalEnfieldLogo } from '@/components/RoyalEnfieldLogo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { registerUser } from '@/features/auth/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bike, Car, Droplet, Wrench, Shield, CheckCircle2 } from 'lucide-react'

const features = [
  { icon: Car, label: 'Vehicle Management', description: 'Complete lifecycle tracking' },
  { icon: Droplet, label: 'Fuel Analytics', description: 'Efficiency insights' },
  { icon: Wrench, label: 'Service Records', description: 'Maintenance history' },
  { icon: Shield, label: 'Document Vault', description: 'Secure storage' },
]

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
    <div className="flex min-h-screen bg-surface-0">
      {/* Left Column — Visual */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-10 overflow-hidden border-r border-border-subtle">
        <div className="absolute inset-0 z-0">
          <img
            src="/garage_login_bg.png"
            alt="Garage background"
            className="object-cover w-full h-full brightness-[0.4] saturate-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-surface-0/90 via-surface-0/50 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex items-center justify-center">
            <RoyalEnfieldLogo className="w-12 h-12" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary font-[family-name:var(--font-display)]">
            MyGarage
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div className="space-y-3">
            <h1 className="text-display text-text-primary max-w-md">
              Start your
              <br />
              <span className="text-accent">precision journey.</span>
            </h1>
            <p className="text-body text-text-secondary max-w-md">
              Create your garage and begin tracking every aspect of your vehicles with surgical precision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-1/60 border border-border-subtle backdrop-blur-sm"
                >
                  <div className="size-8 rounded-[var(--radius-sm)] bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="size-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-text-primary">{feature.label}</div>
                    <div className="text-[11px] text-text-tertiary">{feature.description}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-caption text-text-tertiary"
        >
          © {new Date().getFullYear()} MyGarage. All rights reserved.
        </motion.div>
      </div>

      {/* Right Column — Form */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto space-y-8"
        >
          <div className="flex items-center gap-2 lg:hidden mb-4">
            <div className="flex items-center justify-center">
              <RoyalEnfieldLogo className="w-8 h-8" />
            </div>
            <span className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)]">MyGarage</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-h1 text-text-primary">Create account</h2>
            <p className="text-body-sm text-text-secondary">
              Sign up to start tracking your vehicles
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[var(--radius-lg)] bg-success-muted border border-success/20 p-6 text-center space-y-3"
            >
              <CheckCircle2 className="size-10 text-success mx-auto" />
              <div className="text-h3 text-success">Registration Successful!</div>
              <p className="text-body-sm text-text-secondary">
                Redirecting you to the login screen...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[var(--radius-md)] bg-danger-muted border border-danger/20 p-4 text-body-sm text-danger"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full"
              >
                Create Account
              </Button>

              <p className="text-body-sm text-text-secondary text-center pt-2">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent-hover font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
