'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface FloatingPreviewProps {
  prompt: string;
  imageUrl: string | null;
  position: { x: number; y: number };
}

export function FloatingPreview({ imageSrc, type, version, prompt }: FloatingPreviewProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX + 5, y: e.clientY + 5 })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-50">
        {prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}
      </div>
      <div
        className="fixed pointer-events-none z-40"
        style={{ left: position.x, top: position.y }}
      >
        <div className="relative">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={prompt}
              width={256}
              height={256}
              className="w-64 h-64 object-cover rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </>
  )
}

