import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, RefreshCw, User, Zap, GitFork, FileCode2, CheckCircle2 } from 'lucide-react'
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

/** Extract <edit_file path="...">...</edit_file> blocks from raw AI response.
 *  Returns: clean display text + list of changed file paths */
function extractFileEdits(raw: string): { displayText: string; editedPaths: string[] } {
  const editedPaths: string[] = []
  const regex = /<edit_file\s+path=["']([^"']+)["'][^>]*>[\s\S]*?<\/edit_file>/gi

  let match: RegExpExecArray | null
  while ((match = regex.exec(raw)) !== null) {
    editedPaths.push(match[1].trim())
  }

  // Strip all <edit_file> blocks from display text
  const displayText = raw
    .replace(/<edit_file\s+path=["'][^"']+["'][^>]*>[\s\S]*?<\/edit_file>/gi, '')
    // Clean up leftover blank lines from removal
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { displayText, editedPaths }
}

function parseUserContent(rawContent: string) {
  if (rawContent.trim().startsWith('[') && rawContent.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(rawContent)
      if (Array.isArray(parsed)) return { isJson: true, parsed }
    } catch { /* ignore */ }
  }
  return { isJson: false, parsed: null }
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

  const { displayText, editedPaths } = isAssistant
    ? extractFileEdits(message.content)
    : { displayText: message.content, editedPaths: [] }

  const { isJson, parsed } = parseUserContent(message.content)

  // Strip injected project context from user messages before display
  const userDisplayText = isUser
    ? message.content.split('\n\n[Project:')[0].split('\n\nCurrently open file')[0]
    : displayText

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
        {isUser ? (
          <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {isJson ? (
              <div className="flex flex-col gap-3">
                {(parsed ?? []).map((item: any, idx: number) => {
                  if (item.type === 'text') return <p key={idx} className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                  if (item.type === 'image_url') return (
                    <img key={idx} src={item.image_url.url} alt="attachment"
                      className="max-w-[300px] w-full rounded-lg object-contain max-h-[300px] bg-black/10 border border-border/50" />
                  )
                  return null
                })}
              </div>
            ) : (
              <p>{userDisplayText}</p>
            )}
          </div>
        ) : (
          <div className="w-full text-sm text-foreground/90">
            {/* Clean markdown rendering — no raw XML tags */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className ?? '')
                  const isInline = !match && typeof children === 'string' && !children.includes('\n')
                  if (isInline) {
                    return (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground border border-border/50" {...props}>
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
                p({ children }) { return <p className="mb-3 leading-7 last:mb-0">{children}</p> },
                ul({ children }) { return <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul> },
                ol({ children }) { return <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol> },
                li({ children }) { return <li className="leading-7">{children}</li> },
                h1({ children }) { return <h1 className="mb-3 text-xl font-bold tracking-tight">{children}</h1> },
                h2({ children }) { return <h2 className="mb-2 text-lg font-semibold tracking-tight">{children}</h2> },
                h3({ children }) { return <h3 className="mb-2 text-base font-semibold">{children}</h3> },
                blockquote({ children }) {
                  return <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>
                },
                hr() { return <hr className="my-4 border-border" /> },
                a({ children, href }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80">{children}</a>
                },
                table({ children }) {
                  return (
                    <div className="mb-3 overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  )
                },
                th({ children }) {
                  return <th className="border-b border-border bg-muted/50 px-3 py-2 text-left font-semibold">{children}</th>
                },
                td({ children }) {
                  return <td className="border-b border-border px-3 py-2 last:border-0">{children}</td>
                },
              }}
            >
              {displayText || (isStreaming ? '' : '(empty response)')}
            </ReactMarkdown>
            {isStreaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />}

            {/* Files Changed Card — shown only when AI applied file edits */}
            {!isStreaming && editedPaths.length > 0 && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    {editedPaths.length} file{editedPaths.length > 1 ? 's' : ''} updated
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {editedPaths.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCode2 className="size-3 shrink-0 text-emerald-500/70" />
                      <span className="font-mono truncate">{p.split('/').slice(-2).join('/')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" onClick={copyMessage}
              className="size-6 text-muted-foreground hover:text-foreground" title="Copy">
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
            {onFork && (
              <Button variant="ghost" size="icon-xs" onClick={() => onFork(message.id)}
                className="size-6 text-muted-foreground hover:text-foreground" title="Fork chat">
                <GitFork className="size-3" />
              </Button>
            )}
            {isAssistant && isLast && onRegenerate && (
              <Button variant="ghost" size="icon-xs" onClick={onRegenerate}
                className="size-6 text-muted-foreground hover:text-foreground" title="Regenerate">
                <RefreshCw className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
