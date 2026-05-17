import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, RefreshCw, User, Zap, GitFork, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/CodeBlock'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onRegenerate?: () => void
  isLast?: boolean
  onPreview?: (code: string) => void
  onFork?: (id: string) => void
}

function parseMessageContent(rawContent: string) {
  if (rawContent.trim().startsWith('[') && rawContent.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(rawContent)
      if (Array.isArray(parsed)) {
        return { isJson: true, parsed, text: '', files: [] }
      }
    } catch {
      // ignore and fallback
    }
  }

  const filePrefix = '--- File: '
  const fileSuffix = ' ---\n'
  
  if (!rawContent.includes(filePrefix)) {
    return { isJson: false, text: rawContent, files: [] }
  }

  const parts = rawContent.split(filePrefix)
  const text = parts[0].trim()
  const files: string[] = []

  for (let i = 1; i < parts.length; i++) {
    const endIdx = parts[i].indexOf(fileSuffix)
    if (endIdx !== -1) {
      files.push(parts[i].substring(0, endIdx))
    }
  }

  return { isJson: false, text, files }
}

export function MessageBubble({ message, isStreaming, onRegenerate, isLast, onPreview, onFork }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [message.content])

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  const { isJson, parsed, text, files } = parseMessageContent(message.content)

  return (
    <div className="group flex w-full flex-col gap-2 px-4 py-4 sm:px-6 hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        {isAssistant ? (
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <Zap className="size-3.5 text-primary-foreground" />
          </div>
        ) : (
          <div className="flex size-6 items-center justify-center rounded-md bg-muted-foreground/20">
            <User className="size-3.5 text-foreground" />
          </div>
        )}
        <span className="text-sm font-semibold text-foreground">
          {isAssistant ? 'CodeBolt' : 'You'}
        </span>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-2 pl-8">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 mt-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 rounded-md border border-border bg-background shadow-sm px-2.5 py-1.5 text-xs">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">{file}</span>
              </div>
            ))}
          </div>
        )}

        {isUser ? (
          <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {isJson ? (
              <div className="flex flex-col gap-3">
                {(parsed ?? []).map((item: any, idx: number) => {
                  if (item.type === 'text') {
                    return <p key={idx} className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                  }
                  if (item.type === 'image_url') {
                    return <img key={idx} src={item.image_url.url} alt="User attachment" className="max-w-[300px] w-full rounded-lg object-contain max-h-[300px] bg-black/10 border border-border/50" />
                  }
                  return null
                })}
              </div>
            ) : (
              <p>{text}</p>
            )}
          </div>
        ) : (
          <div className="w-full text-sm text-foreground/90">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className ?? '')
                  const isInline = !match && typeof children === 'string' && !children.includes('\n')

                  if (isInline) {
                    return (
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground border border-border/50"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }

                  return (
                    <CodeBlock language={match?.[1] ?? 'text'} onPreview={onPreview}>
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
              {text}
            </ReactMarkdown>
            {isStreaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />}
          </div>
        )}

        {/* Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={copyMessage}
              className="size-6 text-muted-foreground hover:text-foreground"
              title="Copy message"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
            {onFork && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onFork(message.id)}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Fork chat from here"
              >
                <GitFork className="size-3" />
              </Button>
            )}
            {isAssistant && isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onRegenerate}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Regenerate response"
              >
                <RefreshCw className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
