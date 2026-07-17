import React from 'react'

export function RoyalEnfieldLogo({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`bg-accent ${className}`}
      style={{
        maskImage: 'url(/logo_transparent.png?v=4)',
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: 'url(/logo_transparent.png?v=4)',
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
