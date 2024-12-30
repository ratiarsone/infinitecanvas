'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { RefreshCcw } from 'lucide-react'
import { CanvasImage, GenerationType, PromptHistory } from '../types/canvas'

interface DraggableImageProps {
  image: CanvasImage
  onPositionChange: (id: string, x: number, y: number) => void
  onIteratePrompt: (prompt: string, type: GenerationType, promptHistory: PromptHistory[]) => void
  isSelected?: boolean
}

export function DraggableImage({ 
  image, 
  onPositionChange, 
  onIteratePrompt,
  isSelected 
}: DraggableImageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setStartPos({ x: e.clientX - image.x, y: e.clientY - image.y })
  }, [image.x, image.y])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      
      const newX = e.clientX - startPos.x
      const newY = e.clientY - startPos.y
      
      onPositionChange(image.id, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, image.id, onPositionChange, startPos])

  const handleIterate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onIteratePrompt(image.prompt, image.type, image.promptHistory)
  }

  return (
    <div
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-50' : ''} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: image.x,
        top: image.y,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        <div className="absolute -top-8 left-0 right-0 text-center flex items-center justify-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full shadow-sm text-sm font-medium">
            {image.prompt.length > 30 ? image.prompt.substring(0, 27) + '...' : image.prompt} (v{image.version})
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 shadow-sm"
            onClick={handleIterate}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <img
          src={image.src}
          alt={image.prompt}
          className="w-64 h-64 object-cover rounded-lg shadow-lg"
          draggable={false}
        />
      </div>
    </div>
  )
}

