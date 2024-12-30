'use client'

import { Button } from "@/components/ui/button"
import { Type } from 'lucide-react'

interface TextButtonProps {
  onClick: () => void
  isActive: boolean
}

export function TextButton({ onClick, isActive }: TextButtonProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="icon"
      className="fixed bottom-6 right-24 h-16 w-16 rounded-full shadow-lg"
      onClick={onClick}
    >
      <Type className="h-8 w-8" />
      <span className="sr-only">Add text</span>
    </Button>
  )
}

