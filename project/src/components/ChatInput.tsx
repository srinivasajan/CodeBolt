import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import JSZip from 'jszip'

interface AttachedFile {
  name: string
  content: string
  size: number
}

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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
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
    if ((!trimmed && images.length === 0 && attachedFiles.length === 0) || isStreaming || disabled) return

    let combinedContent = trimmed
    if (attachedFiles.length > 0) {
      const fileTexts = attachedFiles.map(f => `--- File: ${f.name} ---\n${f.content}`).join('\n\n')
      combinedContent = trimmed ? `${trimmed}\n\n${fileTexts}` : fileTexts
    }

    onSend(combinedContent, images.length > 0 ? images : undefined)
    setValue('')
    setImages([])
    setAttachedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, images, attachedFiles, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            setImages(prev => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      } else if (file.name.endsWith('.zip')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            try {
              const zip = new JSZip()
              const zipContent = await zip.loadAsync(e.target.result)
              const extractedFiles: AttachedFile[] = []

              for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
                if (zipEntry.dir) continue
                // Skip binary files and common ignores
                if (filename.includes('node_modules/') || filename.includes('.git/') || filename.match(/\.(png|jpg|jpeg|gif|ico|pdf|zip|tar|gz|mp4|webm|mp3|wav|ogg|wasm|exe)$/i)) {
                  continue
                }
                const textContent = await zipEntry.async('string')
                extractedFiles.push({
                  name: filename,
                  content: textContent,
                  size: textContent.length
                })
              }
              setAttachedFiles(prev => [...prev, ...extractedFiles])
            } catch (err) {
              console.error('Failed to parse ZIP', err)
            }
          }
        }
        reader.readAsArrayBuffer(file)
      } else {
        // Assume text file
        const reader = new FileReader()
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            setAttachedFiles(prev => [...prev, {
              name: file.name,
              content: e.target!.result as string,
              size: file.size
            }])
          }
        }
        reader.readAsText(file)
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const removeAttachedFile = (indexToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        {(images.length > 0 || attachedFiles.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={`img-${idx}`} className="relative group rounded-md border border-border overflow-hidden size-16 bg-muted/50">
                <img src={img} alt="Attachment" className="object-cover w-full h-full" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            
            {attachedFiles.map((f, idx) => (
              <div key={`file-${idx}`} className="flex items-center gap-1.5 rounded-md border border-border bg-card shadow-sm px-2.5 py-1.5 text-xs group">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="max-w-[150px] truncate font-medium text-foreground/80">{f.name}</span>
                <span className="text-[10px] text-muted-foreground">({Math.round(f.size / 1024)}kb)</span>
                <button
                  onClick={() => removeAttachedFile(idx)}
                  className="ml-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground transition-all"
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
            accept="image/*,.zip,text/*,.js,.ts,.jsx,.tsx,.py,.json,.md,.html,.css,.csv" 
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
            <TooltipContent>Attach files (Images, Text, ZIP)</TooltipContent>
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
                    disabled={(!value.trim() && images.length === 0 && attachedFiles.length === 0) || disabled}
                    className={cn('size-7', (!value.trim() && images.length === 0 && attachedFiles.length === 0) && 'opacity-40')}
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
