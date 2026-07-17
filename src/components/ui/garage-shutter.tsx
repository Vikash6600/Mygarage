'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GarageShutterProps {
  isOpen: boolean
}

export function GarageShutter({ isOpen }: GarageShutterProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const shutterVariants: import('framer-motion').Variants = {
    open: { 
      y: "-110%", 
      transition: { duration: 1.0, ease: [0.6, 0.05, 0.01, 0.99] } 
    },
    closed: { 
      y: 0, 
      transition: { duration: 0.4, ease: "easeIn" } // Slower than 0.35, smooth fast fall
    }
  }

  return (
    <motion.div
      initial={isOpen ? "closed" : "open"} // Start in the opposite state so it animates on mount
      animate={isOpen ? "open" : "closed"}
      variants={shutterVariants}
      className="fixed inset-x-0 top-0 h-[110vh] z-[9999] pointer-events-none flex flex-col shadow-[0_30px_60px_rgba(0,0,0,1)] border-b-[24px] border-[#0a0a0a]"
      style={{
        background: 'repeating-linear-gradient(to bottom, #111, #111 48px, #050505 48px, #050505 50px)'
      }}
    >
      {/* Shutter handle / bottom trim */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-transparent to-black flex items-end justify-center pb-2">
        <div className="w-48 h-3 bg-black/60 rounded-full border-b border-white/5" />
      </div>
    </motion.div>
  )
}
