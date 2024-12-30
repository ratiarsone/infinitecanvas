'use client'

import { Users } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface GroupButtonProps {
  onGroup: () => void
}

export function GroupButton({ onGroup }: GroupButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg"
      onClick={onGroup}
    >
      <Users className="h-8 w-8" />
      <span className="sr-only">Group selected items</span>
    </Button>
  )
}

