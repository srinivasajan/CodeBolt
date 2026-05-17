import { useEffect, useRef, useCallback } from 'react'
import { Zap } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import type { Message } from '@/types'

interface ChatAreaProps {
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  chatId: string | null
  onRegenerate?: () => void
  onPreview?: (code: string) => void
  onFork?: (id: string) => void
}

export function ChatArea({
  messages,
  isStreaming,
  streamingContent,
  chatId,
  onRegenerate,
  onPreview,
  onFork,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)

  const scrollToBottom = useCallback((force = false) => {
    if (!force && userScrolledUp.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll on new content
  useEffect(() => {
    if (isStreaming) {
      userScrolledUp.current = false
      scrollToBottom(true)
    }
  }, [streamingContent, isStreaming, scrollToBottom])

  useEffect(() => {
    userScrolledUp.current = false
    scrollToBottom(true)
  }, [chatId, scrollToBottom])

  useEffect(() => {
    if (!isStreaming) {
      setTimeout(() => scrollToBottom(true), 50)
    }
  }, [messages.length, isStreaming, scrollToBottom])

  if (!chatId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              CodeBolt AI
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Select a chat or create a new one to start building, debugging, and iterating.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">New conversation</p>
            <p className="mt-1 text-xs text-muted-foreground">Ask me anything about code</p>
          </div>
        </div>
      </div>
    )
  }

  // Streaming message as a virtual message
  const streamingMsg = isStreaming
    ? {
        id: '__streaming__',
        chat_id: chatId,
        role: 'assistant' as const,
        content: streamingContent,
        created_at: new Date().toISOString(),
      }
    : null

  const allMessages = streamingMsg ? [...messages, streamingMsg] : messages

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="flex-1 overflow-y-auto"
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current
          if (!el) return
          const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
          userScrolledUp.current = distFromBottom > 100
        }}
      >
        <div className="mx-auto max-w-4xl py-6">
          {allMessages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === '__streaming__'}
              isLast={idx === allMessages.length - 1}
              onRegenerate={
                msg.role === 'assistant' && idx === allMessages.length - 1 && !isStreaming
                  ? onRegenerate
                  : undefined
              }
              onPreview={onPreview}
              onFork={onFork}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  )
}
