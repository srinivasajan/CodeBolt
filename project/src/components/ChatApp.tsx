import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Zap, LogOut } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatArea } from '@/components/ChatArea'
import { ChatInput } from '@/components/ChatInput'
import { ModelSelector } from '@/components/ModelSelector'
import { SettingsPanel } from '@/components/SettingsPanel'
import { useChats } from '@/hooks/useChats'
import { useMessages } from '@/hooks/useMessages'
import type { Chat } from '@/types'
import { NVIDIA_MODELS } from '@/types'

export default function ChatApp() {
  const navigate = useNavigate()
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const {
    chats,
    loading: chatsLoading,
    createChat,
    deleteChat,
    renameChat,
    updateChatModel,
    updateChatTitle,
  } = useChats()

  const {
    messages,
    isStreaming,
    streamingContent,
    settings,
    setSettings,
    sendMessage,
    stopStreaming,
    regenerateLastResponse,
  } = useMessages(activeChatId)

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null
  const activeModel = activeChat?.model ?? NVIDIA_MODELS[0].id

  const handleNewChat = useCallback(async () => {
    const chat = await createChat(activeModel)
    if (chat) {
      setActiveChatId(chat.id)
    }
  }, [createChat, activeModel])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewChat()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNewChat])

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChatId(chat.id)
  }, [])

  const handleDeleteChat = useCallback(
    async (id: string) => {
      await deleteChat(id)
      if (activeChatId === id) {
        const remaining = chats.filter((c) => c.id !== id)
        setActiveChatId(remaining[0]?.id ?? null)
      }
      toast.success('Chat deleted')
    },
    [deleteChat, activeChatId, chats]
  )

  const handleModelChange = useCallback(
    async (model: string) => {
      if (!activeChatId) return
      await updateChatModel(activeChatId, model)
    },
    [activeChatId, updateChatModel]
  )

  const handleSend = useCallback(
    (content: string, images?: string[]) => {
      if (!activeChatId) {
        toast.error('Please select or create a chat first')
        return
      }
      sendMessage(content, activeModel, (title) => {
        updateChatTitle(activeChatId, title)
      }, images)
    },
    [activeChatId, activeModel, sendMessage, updateChatTitle]
  )

  const handleRegenerate = useCallback(() => {
    regenerateLastResponse(activeModel)
  }, [activeModel, regenerateLastResponse])

  const handleLogout = () => {
    localStorage.removeItem('VITE_NVIDIA_API_KEY')
    navigate('/')
  }

  // Auto-select first chat
  useEffect(() => {
    if (!chatsLoading && chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id)
    }
  }, [chatsLoading, chats, activeChatId])

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden text-foreground">
        {/* Sidebar */}
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={handleSelectChat}
          onCreate={handleNewChat}
          onDelete={handleDeleteChat}
          onRename={renameChat}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden border-l border-border/60 bg-background/80 backdrop-blur-xl">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <Link to="/" className="mr-1 flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-2.5 py-1.5 shadow-sm hover:bg-card/90 transition-colors">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/20">
                    <Zap className="size-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">CODEBOLT</span>
                </Link>
              )}
              <ModelSelector
                value={activeModel}
                onChange={handleModelChange}
                disabled={!activeChatId || isStreaming}
              />
              {isStreaming && (
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs shadow-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-muted-foreground">Generating…</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                disabled={isStreaming}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleNewChat}
                className="size-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                className="size-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Logout"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>

          {/* Chat area */}
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            chatId={activeChatId}
            onRegenerate={handleRegenerate}
          />

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            disabled={!activeChatId}
            placeholder={
              activeChatId
                ? 'Message CODEBOLT... (Shift+Enter for newline)'
                : 'Create a new chat to start...'
            }
          />
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
