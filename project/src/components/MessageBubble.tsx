import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, RefreshCw, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/CodeBlock'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onRegenerate?: () => void
  isLast?: boolean
}

export function MessageBubble({ message, isStreaming, onRegenerate, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [message.content])

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'group flex w-full gap-3 px-4 py-3 sm:px-6',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar */}
      {isAssistant && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary">
          <Zap className="size-3.5 text-primary-foreground" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'flex max-w-[90%] flex-col gap-2 sm:max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-inset ring-white/10">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5 sm:py-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className ?? '')
                  const isInline = !match && typeof children === 'string' && !children.includes('\n')

                  if (isInline) {
                    return (
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }

                  return (
                    <CodeBlock language={match?.[1] ?? 'text'}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  )
                },
                p({ children }) {
                  return <p className="mb-3 leading-7 last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
                },
                li({ children }) {
                  return <li className="leading-7">{children}</li>
                },
                h1({ children }) {
                  return <h1 className="mb-3 text-xl font-bold tracking-tight">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="mb-2 text-lg font-semibold tracking-tight">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="mb-2 text-base font-semibold">{children}</h3>
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  )
                },
                hr() {
                  return <hr className="my-4 border-border" />
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {children}
                    </a>
                  )
                },
                table({ children }) {
                  return (
                    <div className="mb-3 overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  )
                },
                th({ children }) {
                  return (
                    <th className="border-b border-border bg-muted/50 px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  )
                },
                td({ children }) {
                  return <td className="border-b border-border px-3 py-2 last:border-0">{children}</td>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />}
          </div>
        )}

        {/* Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={copyMessage}
              className="size-6 text-muted-foreground"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
            {isAssistant && isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onRegenerate}
                className="size-6 text-muted-foreground"
              >
                <RefreshCw className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
          <User className="size-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
