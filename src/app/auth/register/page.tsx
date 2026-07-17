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
    <div className="bg-black min-h-screen w-full overflow-hidden relative font-[family-name:var(--font-display)]">
      
      {/* Cinematic Fade Container */}
      <motion.div 
        className="relative flex min-h-screen flex-col items-center justify-end bg-black overflow-hidden pb-12 sm:pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      >
        {/* Full Screen BMW Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img
            src="/bg-bmw.png"
            alt=""
            className="object-cover w-full h-full object-[center_top]"
          />
          {/* Subtle gradient to ensure bottom is pitch black for the form */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Minimalist HUD Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[500px] px-6 mx-auto flex flex-col items-center"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle2 className="size-12 text-[#FF4500] mx-auto opacity-80" />
              <div className="text-xl tracking-[0.2em] font-mono text-white">SYSTEM INITIALIZED</div>
              <p className="text-xs tracking-[0.1em] font-mono text-neutral-500">
                PROCEEDING TO IGNITION...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-8 flex flex-col items-center">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 text-sm tracking-widest text-[#FF3B00] text-center font-mono uppercase"
                >
                  {error}
                </motion.div>
              )}

              {/* Inputs - Stealth Underlines */}
              <div className="w-full space-y-6">
                <div className="relative group">
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="FULL NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-800 focus:border-white text-center text-lg text-white placeholder:text-neutral-700 tracking-[0.2em] py-3 outline-none transition-colors duration-500 font-mono"
                  />
                </div>

                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-800 focus:border-white text-center text-lg text-white placeholder:text-neutral-700 tracking-[0.2em] py-3 outline-none transition-colors duration-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-800 focus:border-white text-center text-lg text-white placeholder:text-neutral-700 tracking-[0.2em] py-3 outline-none transition-colors duration-500 font-mono"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="CONFIRM"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-800 focus:border-white text-center text-lg text-white placeholder:text-neutral-700 tracking-[0.2em] py-3 outline-none transition-colors duration-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Subtle Create Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-8 group relative w-full h-12 border-b border-neutral-800 flex items-center justify-center hover:border-white transition-colors duration-500 focus:outline-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs font-bold tracking-[0.3em] text-neutral-500 group-hover:text-white transition-colors duration-500">
                    CREATE ACCOUNT
                  </span>
                )}
              </button>

              <div className="pt-8 text-center">
                <Link href="/auth/login" className="text-[10px] font-mono tracking-[0.2em] text-neutral-600 hover:text-white transition-colors duration-300">
                  RETURN TO IGNITION
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
