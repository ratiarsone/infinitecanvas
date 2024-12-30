'use client'

interface SelectionOverlayProps {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function SelectionOverlay({ startX, startY, currentX, currentY }: SelectionOverlayProps) {
  const left = Math.min(startX, currentX)
  const top = Math.min(startY, currentY)
  const width = Math.abs(currentX - startX)
  const height = Math.abs(currentY - startY)

  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
      style={{
        left,
        top,
        width,
        height
      }}
    />
  )
}

