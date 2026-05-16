import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            'flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm transition-colors',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            disabled && 'opacity-60'
          )}
        >
          {/* File attachment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled || isStreaming}
                className="m-1.5 size-7 shrink-0 text-muted-foreground"
                onClick={() => {}}
              >
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? 'Message CODEBOLT... (Shift+Enter for newline)'}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/60',
              'max-h-[200px] min-h-[40px]'
            )}
          />

          {/* Send / Stop */}
          <div className="m-1.5 shrink-0">
            {isStreaming ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={onStop}
                    className="size-7"
                  >
                    <Square className="size-3.5 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop generating</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    className={cn('size-7', !value.trim() && 'opacity-40')}
                  >
                    <Send className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send (Enter)</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
          AI can make mistakes. Verify important code before shipping.
        </p>
      </div>
    </div>
  )
}
