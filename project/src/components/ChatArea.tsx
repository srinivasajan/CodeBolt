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
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-inset ring-primary/15">
              <Zap className="size-8 text-primary" />
            </div>
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                CODEBOLT
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                An AI coding workspace that feels fast.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                Select a chat or create a new one to start building, debugging, and iterating with
                streaming responses.
              </p>
            </div>
            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Write a React hook for debouncing',
                'Explain TypeScript generics',
                'Debug my async/await code',
                'Optimize SQL query performance',
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-background/90"
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="rounded-[2rem] border border-border/60 bg-card/70 px-6 py-8 text-center shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-inset ring-primary/15">
            <Zap className="size-6 text-primary" />
          </div>
          <div className="mt-4">
            <p className="text-base font-semibold">New conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">Ask me anything about code</p>
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
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  )
}
