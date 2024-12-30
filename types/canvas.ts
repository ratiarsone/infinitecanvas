export type GenerationType = 'location' | 'character' | 'object'

export interface Board {
  id: string
  name: string
  createdAt: number
  images: CanvasImage[]
  texts: CanvasText[]
  groups: CanvasGroup[]
}

export interface CanvasImage {
  id: string
  src: string
  x: number
  y: number
  prompt: string
  type: GenerationType
  version: number
  basePrompt?: string
  promptHistory: PromptHistory[]
  groupId?: string
}

export interface CanvasText {
  id: string
  content: string
  x: number
  y: number
  isEditing?: boolean
  fontSize?: 'small' | 'medium' | 'large'
  groupId?: string
}

export interface CanvasGroup {
  id: string
  memberIds: string[]
}

export interface PromptHistory {
  prompt: string
  version: number
  timestamp: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

