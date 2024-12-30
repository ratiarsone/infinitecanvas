'use client'

import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { AddButton } from '../components/add-button'
import { BoardMenu } from '../components/board-menu'
import { ChatInterface } from '../components/chat-interface'
import { InfiniteCanvas } from '../components/infinite-canvas'
import { FloatingPreview } from '../components/floating-preview'
import { generateImageFromPrompt } from './actions'
import { Board, CanvasImage, GenerationType, PromptHistory, CanvasText } from '../types/canvas'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { TextButton } from '../components/text-button'

export default function Page() {
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [selectedType, setSelectedType] = useState<GenerationType | null>(null)
  const [pendingImage, setPendingImage] = useState<{ 
    src: string; 
    prompt: string; 
    type: GenerationType;
    basePrompt?: string;
    promptHistory: PromptHistory[];
  } | null>(null)
  const [iteratingPrompt, setIteratingPrompt] = useState<string | null>(null)
  const [currentPromptHistory, setCurrentPromptHistory] = useState<PromptHistory[]>([])
  const { toast } = useToast()
  const [isAddingText, setIsAddingText] = useState(false)

  const getNextVersion = (basePrompt: string) => {
    if (!currentBoard) return 1
    const relatedImages = currentBoard.images.filter(img => 
      img.basePrompt === basePrompt || img.prompt === basePrompt
    )
    return relatedImages.length + 1
  }

  const getPositionForNewImage = (basePrompt?: string) => {
    if (!currentBoard) return { x: 100, y: 100 }
    
    if (!basePrompt) {
      const typeImages = currentBoard.images.filter(img => !img.basePrompt)
      const y = typeImages.length > 0 
        ? Math.max(...typeImages.map(img => img.y)) + 400
        : 100
      return { x: 100, y }
    } else {
      const relatedImages = currentBoard.images.filter(img => 
        img.basePrompt === basePrompt || img.prompt === basePrompt
      )
      const lastImage = relatedImages[relatedImages.length - 1]
      return {
        x: lastImage ? lastImage.x + 300 : 100,
        y: lastImage ? lastImage.y : 100
      }
    }
  }

  const handleCreateBoard = (name: string) => {
    const newBoard: Board = {
      id: nanoid(),
      name,
      createdAt: Date.now(),
      images: []
    }
    setBoards(prev => [...prev, newBoard])
    setCurrentBoard(newBoard)
    toast({
      title: "Board created"
    })
  }

  const handleDeleteBoard = (id: string) => {
    setBoards(prev => prev.filter(board => board.id !== id))
    if (currentBoard?.id === id) {
      setCurrentBoard(null)
    }
    toast({
      title: "Board deleted"
    })
  }

  const handleRenameBoard = (id: string, name: string) => {
    setBoards(prev => prev.map(board => 
      board.id === id ? { ...board, name } : board
    ))
    if (currentBoard?.id === id) {
      setCurrentBoard(prev => prev ? { ...prev, name } : null)
    }
    toast({
      title: "Board renamed"
    })
  }

  const handleSelectBoard = (id: string) => {
    const board = boards.find(b => b.id === id)
    if (board) {
      setCurrentBoard(board)
    }
  }

  const handleUpdateImagePosition = (id: string, x: number, y: number) => {
    if (!currentBoard) return

    const image = currentBoard.images.find(img => img.id === id)
    if (!image) return

    const dx = x - image.x
    const dy = y - image.y

    const updatedImages = currentBoard.images.map(img => {
      if (img.id === id || (image.groupId && img.groupId === image.groupId)) {
        return {
          ...img,
          x: img.x + dx,
          y: img.y + dy
        }
      }
      return img
    })

    const updatedTexts = (currentBoard.texts || []).map(text => {
      if (image.groupId && text.groupId === image.groupId) {
        return {
          ...text,
          x: text.x + dx,
          y: text.y + dy
        }
      }
      return text
    })

    setCurrentBoard(prev => ({
      ...prev!,
      images: updatedImages,
      texts: updatedTexts
    }))

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, images: updatedImages, texts: updatedTexts }
        : board
    ))
  }

  const handleGenerateImage = async (
    prompt: string, 
    type: GenerationType, 
    promptHistory: PromptHistory[] = []
  ) => {
    if (!currentBoard) {
      toast({
        title: "Please select a board first",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Generating..."
    })
    
    const result = await generateImageFromPrompt(prompt, type, promptHistory)
    
    if (result.success && result.image) {
      toast({
        title: "Processing image...",
      })
    
      await new Promise(resolve => setTimeout(resolve, 100))

      const basePrompt = iteratingPrompt || undefined
      const version = getNextVersion(basePrompt || prompt)
      
      const newPromptHistory = [
        ...promptHistory,
        {
          prompt,
          version,
          timestamp: Date.now()
        }
      ]

      setPendingImage({
        src: result.image,
        prompt: result.prompt,
        type: result.type,
        basePrompt,
        promptHistory: newPromptHistory
      })
      setSelectedType(null)
      setIteratingPrompt(null)
      setCurrentPromptHistory([])

      toast({
        title: "Click to place image"
      })
    } else {
      toast({
        title: "Failed to generate",
        variant: "destructive",
      })
    }
  }

  const handlePlaceImage = (x: number, y: number) => {
    if (pendingImage && currentBoard) {
      const basePrompt = pendingImage.basePrompt
      const version = getNextVersion(basePrompt || pendingImage.prompt)
      const position = getPositionForNewImage(basePrompt)
      
      const newImage: CanvasImage = {
        id: nanoid(),
        ...pendingImage,
        x: position.x,
        y: position.y,
        version,
        promptHistory: pendingImage.promptHistory
      }
      
      setCurrentBoard(prev => ({
        ...prev!,
        images: [...prev!.images, newImage]
      }))

      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { ...board, images: [...board.images, newImage] }
          : board
      ))

      setPendingImage(null)
      
      toast({
        title: `v${version} placed`
      })
    }
  }

  const handleIteratePrompt = (prompt: string, type: GenerationType, promptHistory: PromptHistory[]) => {
    setSelectedType(type)
    setIteratingPrompt(prompt)
    setCurrentPromptHistory(promptHistory)
  }

  const handleAddText = () => {
    setIsAddingText(true)
  }

  const handleCanvasClick = (x: number, y: number) => {
    if (pendingImage) {
      handlePlaceImage(x, y)
    } else if (isAddingText && currentBoard) {
      const newText: CanvasText = {
        id: nanoid(),
        content: '',
        x,
        y,
        isEditing: true
      }
      
      setCurrentBoard(prev => ({
        ...prev!,
        texts: [...(prev!.texts || []), newText]
      }))

      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { ...board, texts: [...(board.texts || []), newText] }
          : board
      ))

      setIsAddingText(false)
    }
  }

  const handleUpdateTextPosition = (id: string, x: number, y: number) => {
    if (!currentBoard) return

    const text = currentBoard.texts?.find(t => t.id === id)
    if (!text) return

    const dx = x - text.x
    const dy = y - text.y

    const updatedTexts = (currentBoard.texts || []).map(t => {
      if (t.id === id || (text.groupId && t.groupId === text.groupId)) {
        return {
          ...t,
          x: t.x + dx,
          y: t.y + dy
        }
      }
      return t
    })

    const updatedImages = currentBoard.images.map(img => {
      if (text.groupId && img.groupId === text.groupId) {
        return {
          ...img,
          x: img.x + dx,
          y: img.y + dy
        }
      }
      return img
    })

    setCurrentBoard(prev => ({
      ...prev!,
      images: updatedImages,
      texts: updatedTexts
    }))

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, images: updatedImages, texts: updatedTexts }
        : board
    ))
  }

  const handleUpdateText = (id: string, content: string, fontSize?: 'small' | 'medium' | 'large') => {
    if (!currentBoard) return

    const updatedTexts = (currentBoard.texts || []).map(text => 
      text.id === id ? { ...text, content, fontSize } : text
    )

    setCurrentBoard(prev => ({
      ...prev!,
      texts: updatedTexts
    }))

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, texts: updatedTexts }
        : board
    ))
  }

  const handleDeleteText = (id: string) => {
    if (!currentBoard) return

    const updatedTexts = (currentBoard.texts || []).filter(text => text.id !== id)

    setCurrentBoard(prev => ({
      ...prev!,
      texts: updatedTexts
    }))

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, texts: updatedTexts }
        : board
    ))
  }

  const handleCreateGroup = (memberIds: string[]) => {
    if (!currentBoard) return

    const newGroup = {
      id: nanoid(),
      memberIds
    }

    // Update images with group ID
    const updatedImages = currentBoard.images.map(img => 
      memberIds.includes(img.id) ? { ...img, groupId: newGroup.id } : img
    )

    // Update texts with group ID
    const updatedTexts = (currentBoard.texts || []).map(text => 
      memberIds.includes(text.id) ? { ...text, groupId: newGroup.id } : text
    )

    // Add group to board
    setCurrentBoard(prev => ({
      ...prev!,
      images: updatedImages,
      texts: updatedTexts,
      groups: [...(prev!.groups || []), newGroup]
    }))

    // Update boards state
    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? {
            ...board,
            images: updatedImages,
            texts: updatedTexts,
            groups: [...(board.groups || []), newGroup]
          }
        : board
    ))

    toast({
      title: "Group created"
    })
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <BoardMenu
        boards={boards}
        currentBoard={currentBoard}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        onRenameBoard={handleRenameBoard}
        onSelectBoard={handleSelectBoard}
      />
      
      <div className={`ml-64 transition-all duration-300 ${
        pendingImage || isAddingText ? 'cursor-cell' : 'cursor-default'
      }`}>
        {currentBoard ? (
          <>
            <InfiniteCanvas 
              images={currentBoard.images} 
              texts={currentBoard.texts || []}
              onCanvasClick={handleCanvasClick}
              isPendingPlacement={!!pendingImage}
              isAddingText={isAddingText}
              onUpdateImagePosition={handleUpdateImagePosition}
              onUpdateTextPosition={handleUpdateTextPosition}
              onUpdateText={handleUpdateText}
              onDeleteText={handleDeleteText}
              onIteratePrompt={handleIteratePrompt}
              onCreateGroup={handleCreateGroup}
            />
            {!pendingImage && (
              <>
                <AddButton onSelect={setSelectedType} />
                <TextButton 
                  onClick={handleAddText} 
                  isActive={isAddingText} 
                />
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg text-gray-500">Select or create a board to get started</p>
          </div>
        )}
      </div>

      {selectedType && !pendingImage && (
        <ChatInterface
          type={selectedType}
          onClose={() => {
            setSelectedType(null)
            setIteratingPrompt(null)
            setCurrentPromptHistory([])
          }}
          onGenerateImage={handleGenerateImage}
          initialPrompt={iteratingPrompt || undefined}
          promptHistory={currentPromptHistory}
        />
      )}
      {pendingImage && (
        <FloatingPreview 
          imageSrc={pendingImage.src}
          type={pendingImage.type}
          version={getNextVersion(pendingImage.basePrompt || pendingImage.prompt)}
          prompt={pendingImage.prompt}
        />
      )}
      <Toaster />
    </main>
  )
}

