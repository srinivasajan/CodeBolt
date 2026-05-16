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
}

export function ChatArea({
  messages,
  isStreaming,
  streamingContent,
  chatId,
  onRegenerate,
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
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="size-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">CODEBOLT</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your ultra-fast AI coding assistant. Select a chat or create a new one to start.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md w-full">
          {[
            'Write a React hook for debouncing',
            'Explain TypeScript generics',
            'Debug my async/await code',
            'Optimize SQL query performance',
          ].map((prompt) => (
            <div
              key={prompt}
              className="cursor-default rounded-lg border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:bg-card transition-colors"
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="size-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium">New conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">Ask me anything about code</p>
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
        <div className="mx-auto max-w-3xl py-4">
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
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  )
}
