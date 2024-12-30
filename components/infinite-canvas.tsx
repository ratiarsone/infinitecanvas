'use client'

import { useRef, useCallback, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { CanvasImage, CanvasText, GenerationType, PromptHistory } from '../types/canvas'
import { DraggableImage } from './draggable-image'
import { DraggableText } from './draggable-text'
import { SelectionOverlay } from './selection-overlay'
import { GroupButton } from './group-button'
import { nanoid } from 'nanoid'
import { SelectionCount } from './selection-count'

interface InfiniteCanvasProps {
  images: CanvasImage[]
  texts: CanvasText[]
  onCanvasClick: (x: number, y: number) => void
  isPendingPlacement: boolean
  isAddingText: boolean
  onUpdateImagePosition: (id: string, x: number, y: number) => void
  onUpdateTextPosition: (id: string, x: number, y: number) => void
  onUpdateText: (id: string, content: string) => void
  onDeleteText: (id: string) => void
  onIteratePrompt: (prompt: string, type: GenerationType, promptHistory: PromptHistory[]) => void
  onCreateGroup: (memberIds: string[]) => void
}

export function InfiniteCanvas({ 
  images, 
  texts,
  onCanvasClick, 
  isPendingPlacement,
  isAddingText,
  onUpdateImagePosition,
  onUpdateTextPosition,
  onUpdateText,
  onDeleteText,
  onIteratePrompt,
  onCreateGroup
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
  const [selectionCurrent, setSelectionCurrent] = useState({ x: 0, y: 0 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isPendingPlacement || isAddingText) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsSelecting(true)
    setSelectionStart({ x, y })
    setSelectionCurrent({ x, y })
  }, [isPendingPlacement, isAddingText])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setSelectionCurrent({ x, y })

    // Calculate selected items
    const left = Math.min(selectionStart.x, x)
    const right = Math.max(selectionStart.x, x)
    const top = Math.min(selectionStart.y, y)
    const bottom = Math.max(selectionStart.y, y)

    const selectedImages = images.filter(image => {
      const imageRight = image.x + 256 // Assuming image width is 256px
      const imageBottom = image.y + 256
      return (
        image.x < right &&
        imageRight > left &&
        image.y < bottom &&
        imageBottom > top
      )
    })

    const selectedTexts = texts.filter(text => {
      return (
        text.x < right &&
        text.x > left &&
        text.y < bottom &&
        text.y > top
      )
    })

    setSelectedIds([
      ...selectedImages.map(img => img.id),
      ...selectedTexts.map(text => text.id)
    ])
  }, [isSelecting, selectionStart, images, texts])

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false)
  }, [])

  const handleCreateGroup = useCallback(() => {
    if (selectedIds.length > 1) {
      onCreateGroup(selectedIds)
      setSelectedIds([])
    }
  }, [selectedIds, onCreateGroup])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const scale = rect.width / containerRef.current.offsetWidth
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    onCanvasClick(x, y)
  }, [onCanvasClick])

  return (
    <div className="w-full h-screen bg-grid-pattern">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        limitToBounds={false}
        disabled={isPendingPlacement || isAddingText || isSelecting}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full"
        >
          <div 
            ref={containerRef}
            className="relative w-[10000px] h-[10000px]"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {images.map((image) => (
              <DraggableImage
                key={image.id}
                image={image}
                onPositionChange={onUpdateImagePosition}
                onIteratePrompt={onIteratePrompt}
                isSelected={selectedIds.includes(image.id)}
              />
            ))}
            {texts.map((text) => (
              <DraggableText
                key={text.id}
                text={text}
                onPositionChange={onUpdateTextPosition}
                onTextChange={onUpdateText}
                onTextDelete={onDeleteText}
                isSelected={selectedIds.includes(text.id)}
              />
            ))}
            {isSelecting && (
              <SelectionOverlay
                startX={selectionStart.x}
                startY={selectionStart.y}
                currentX={selectionCurrent.x}
                currentY={selectionCurrent.y}
              />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
      <SelectionCount count={selectedIds.length} />
      {selectedIds.length > 1 && (
        <GroupButton onGroup={handleCreateGroup} />
      )}
    </div>
  )
}

