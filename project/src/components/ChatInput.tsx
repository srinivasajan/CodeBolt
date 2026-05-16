import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (content: string, images?: string[]) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [images, setImages] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if ((!trimmed && images.length === 0) || isStreaming || disabled) return
    onSend(trimmed, images.length > 0 ? images : undefined)
    setValue('')
    setImages([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, images, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImages(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group rounded-md border border-border overflow-hidden size-16 bg-muted/50">
                <img src={img} alt="Attachment" className="object-cover w-full h-full" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div
          className={cn(
            'flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm transition-colors',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            disabled && 'opacity-60'
          )}
        >
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
          />

          {/* File attachment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled || isStreaming}
                className="m-1.5 size-7 shrink-0 text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach image</TooltipContent>
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
                    disabled={(!value.trim() && images.length === 0) || disabled}
                    className={cn('size-7', (!value.trim() && images.length === 0) && 'opacity-40')}
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
