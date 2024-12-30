'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Type, Bold, Italic, Underline } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CanvasText } from '../types/canvas'

interface DraggableTextProps {
  text: CanvasText
  onPositionChange: (id: string, x: number, y: number) => void
  onTextChange: (id: string, content: string, fontSize?: 'small' | 'medium' | 'large') => void
  onTextDelete: (id: string) => void
  isSelected?: boolean
}

export function DraggableText({ 
  text, 
  onPositionChange, 
  onTextChange,
  onTextDelete,
  isSelected
}: DraggableTextProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(text.isEditing)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return
    e.stopPropagation()
    setIsDragging(true)
    setStartPos({ x: e.clientX - text.x, y: e.clientY - text.y })
  }, [text.x, text.y, isEditing])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      
      const newX = e.clientX - startPos.x
      const newY = e.clientY - startPos.y
      
      onPositionChange(text.id, newX, newY)
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
  }, [isDragging, text.id, onPositionChange, startPos])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!text.content) {
        onTextDelete(text.id)
      }
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (!text.content) {
      onTextDelete(text.id)
    }
  }

  return (
    <div
      className={`absolute ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: text.x,
        top: text.y,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <Input
          ref={inputRef}
          value={text.content}
          onChange={(e) => onTextChange(text.id, e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="min-w-[200px] bg-white/90 backdrop-blur-sm"
          placeholder="Type something..."
          autoFocus
        />
      ) : (
        <div className="group flex items-center gap-2">
          <div className={`px-3 py-1.5 ${
            text.fontSize === 'small' ? 'text-sm' :
            text.fontSize === 'large' ? 'text-3xl' :
            'text-xl'
          } ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}>
            {text.content || <span className="opacity-50">Double-click to edit</span>}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsBold(!isBold)
              }}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsItalic(!isItalic)
              }}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsUnderline(!isUnderline)
              }}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onTextChange(text.id, text.content, 'small')}>
                  <span className="text-sm">Small</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTextChange(text.id, text.content, 'medium')}>
                  <span className="text-xl">Medium</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTextChange(text.id, text.content, 'large')}>
                  <span className="text-3xl">Large</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}

