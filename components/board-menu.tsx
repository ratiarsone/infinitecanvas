'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Board } from '../types/canvas'

interface BoardMenuProps {
  boards: Board[]
  currentBoard: Board | null
  onCreateBoard: (name: string) => void
  onDeleteBoard: (id: string) => void
  onRenameBoard: (id: string, name: string) => void
  onSelectBoard: (id: string) => void
}

export function BoardMenu({
  boards,
  currentBoard,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onSelectBoard,
}: BoardMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [editingBoard, setEditingBoard] = useState<{ id: string, name: string } | null>(null)

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim())
      setNewBoardName('')
    }
  }

  const handleRenameBoard = () => {
    if (editingBoard && editingBoard.name.trim()) {
      onRenameBoard(editingBoard.id, editingBoard.name.trim())
      setEditingBoard(null)
    }
  }

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-black text-white transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-64'
      }`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-4 top-4 bg-black text-white rounded-full h-8 w-8 p-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="p-4 space-y-4">
        {!isCollapsed && (
          <>
            <h2 className="text-lg font-semibold mb-4">Boards</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-white border-white hover:bg-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Board name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                  />
                  <Button onClick={handleCreateBoard}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={`group flex items-center justify-between p-2 rounded hover:bg-white/10 cursor-pointer ${
                    currentBoard?.id === board.id ? 'bg-white/20' : ''
                  }`}
                  onClick={() => onSelectBoard(board.id)}
                >
                  {editingBoard?.id === board.id ? (
                    <Input
                      value={editingBoard.name}
                      onChange={(e) => setEditingBoard({ ...editingBoard, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameBoard()}
                      onBlur={handleRenameBoard}
                      className="h-6 text-black"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="truncate cursor-pointer hover:text-blue-200" 
                      onClick={() => onSelectBoard(board.id)}
                    >
                      {board.name}
                    </span>
                  )}
                  
                  <div className="opacity-0 group-hover:opacity-100 space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-white hover:text-blue-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingBoard({ id: board.id, name: board.name })
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-white hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteBoard(board.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

