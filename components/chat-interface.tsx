'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizontal, X } from 'lucide-react'
import { ChatMessage, PromptHistory } from '../types/canvas'

interface ChatInterfaceProps {
  type: GenerationType
  onClose: () => void
  onGenerateImage: (prompt: string, type: GenerationType, promptHistory: PromptHistory[]) => void
  initialPrompt?: string
  promptHistory?: PromptHistory[]
}

export function ChatInterface({ 
  type, 
  onClose, 
  onGenerateImage, 
  initialPrompt,
  promptHistory = []
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: initialPrompt 
      ? `Previous versions:\n${promptHistory.map(p => `v${p.version}: ${p.prompt}`).join('\n')}\n\nLet's iterate on this. How would you like to modify it?`
      : `Let's generate a ${type}! Describe what you'd like to create.`
  }])
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    
    // Generate image immediately
    onGenerateImage(input, type, promptHistory)
    onClose() // Close chat window immediately after submission
    setInput('')
  }

  return (
    <Card className="fixed bottom-24 right-4 w-96 h-96 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">
          {initialPrompt ? 'Iterate on image' : `Generate ${type}`}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`mb-4 ${
              message.role === 'assistant' ? 'pl-4' : 'pr-4'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                message.role === 'assistant'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your image..."
          />
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}

