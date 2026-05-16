import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Chat } from '@/types'

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chat: Chat) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupChats(chats: Chat[]): Record<string, Chat[]> {
  const groups: Record<string, Chat[]> = {}
  for (const chat of chats) {
    const label = formatDate(chat.updated_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(chat)
  }
  return groups
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  collapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const startEdit = useCallback((chat: Chat) => {
    setEditingId(chat.id)
    setEditValue(chat.title)
  }, [])

  const commitEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim())
    }
    setEditingId(null)
  }, [editingId, editValue, onRename])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const grouped = groupChats(chats)

  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-r border-border bg-sidebar py-3 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <ChevronRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand sidebar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCreate}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New chat</TooltipContent>
        </Tooltip>

        <Separator className="w-6 bg-sidebar-border" />

        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-1 px-1">
            {chats.slice(0, 20).map((chat) => (
              <Tooltip key={chat.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelect(chat)}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md transition-colors',
                      activeChatId === chat.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <MessageSquare className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{chat.title}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">CODEBOLT</span>
        </Link>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onCreate}
                className="size-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New chat (Ctrl+N)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleCollapse}
                className="size-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse sidebar</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2 py-2">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <MessageSquare className="size-8 text-sidebar-foreground/30" />
            <p className="text-xs text-sidebar-foreground/50">No chats yet</p>
            <Button size="xs" variant="outline" onClick={onCreate} className="mt-1">
              <Plus className="size-3" />
              New Chat
            </Button>
          </div>
        ) : (
          Object.entries(grouped).map(([label, groupChats]) => (
            <div key={label} className="mb-3">
              <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {label}
              </p>
              {groupChats.map((chat) => (
                <div
                  key={chat.id}
                  className="relative"
                  onMouseEnter={() => setHoveredId(chat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {editingId === chat.id ? (
                    <div className="flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="h-6 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={commitEdit}
                        className="size-5 text-sidebar-foreground/60"
                      >
                        <Check className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={cancelEdit}
                        className="size-5 text-sidebar-foreground/60"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(chat)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                        activeChatId === chat.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )}
                    >
                      <MessageSquare className="size-3.5 shrink-0 text-sidebar-foreground/40" />
                      <span className="flex-1 truncate text-xs">{chat.title}</span>
                      {hoveredId === chat.id && (
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => startEdit(chat)}
                            className="rounded p-0.5 text-sidebar-foreground/40 hover:text-sidebar-foreground"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            onClick={() => onDelete(chat.id)}
                            className="rounded p-0.5 text-sidebar-foreground/40 hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-2">
        <p className="text-[10px] text-sidebar-foreground/30">
          {chats.length} chat{chats.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
