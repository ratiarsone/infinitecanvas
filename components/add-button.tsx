'use client'

import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GenerationType } from '@/types/canvas'

interface AddButtonProps {
  onSelect: (type: GenerationType) => void
}

export function AddButton({ onSelect }: AddButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant="default"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-black hover:bg-black/80"
        >
          <Plus className="h-8 w-8 text-white" />
          <span className="sr-only">Add new generation</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onSelect('location')}>
          Generate Location
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('character')}>
          Generate Character
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('object')}>
          Generate Object
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

