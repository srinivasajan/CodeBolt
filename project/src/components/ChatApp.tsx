import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Zap, LogOut, DownloadCloud, Code2, MessageSquare, X } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatArea } from '@/components/ChatArea'
import { ChatInput } from '@/components/ChatInput'
import { ModelSelector } from '@/components/ModelSelector'
import { SettingsPanel } from '@/components/SettingsPanel'
import { CodePreviewPanel } from '@/components/CodePreviewPanel'
import { useChats } from '@/hooks/useChats'
import { useMessages } from '@/hooks/useMessages'
import { cn } from '@/lib/utils'
import type { Chat } from '@/types'
import { NVIDIA_MODELS } from '@/types'
import { supabase } from '@/lib/supabase'

export default function ChatApp() {
  const navigate = useNavigate()
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const [previewCode, setPreviewCode] = useState<string | null>(null)

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

  const handleExportChat = useCallback(() => {
    if (!messages || messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    const title = activeChat?.title || 'Chat Export'
    let mdContent = `# ${title}\n\n`
    mdContent += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`

    messages.forEach((m) => {
      const roleName = m.role === 'user' ? '🧑‍💻 User' : '🤖 CodeBolt'
      let contentStr = ''
      
      try {
        if (m.content.trim().startsWith('[') && m.content.trim().endsWith(']')) {
          const parsed = JSON.parse(m.content)
          if (Array.isArray(parsed)) {
            contentStr = parsed.map((item: any) => {
              if (item.type === 'text') return item.text
              if (item.type === 'image_url') return `*[Attached Image]*`
              return ''
            }).join('\n')
          } else {
            contentStr = m.content
          }
        } else {
          contentStr = m.content
        }
      } catch {
        contentStr = m.content
      }

      mdContent += `### ${roleName}\n\n${contentStr}\n\n---\n\n`
    })

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-export.md`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Chat exported successfully')
  }, [messages, activeChat])

  const handleForkChat = useCallback(async (messageId: string) => {
    if (!activeChatId || !activeChat) return

    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // Slice messages up to the chosen message
    const forkedMessages = messages.slice(0, messageIndex + 1)

    // Create a new chat
    const newChat = await createChat(activeChat.model)
    if (!newChat) {
      toast.error('Failed to create branched chat')
      return
    }

    // Rename the new chat
    const newTitle = `${activeChat.title || 'Chat'} (Fork)`
    await renameChat(newChat.id, newTitle)

    // Insert the messages into the new chat
    const messagesToInsert = forkedMessages.map(m => ({
      chat_id: newChat.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at
    }))

    const { error } = await supabase.from('messages').insert(messagesToInsert)

    if (error) {
      console.error('Error copying messages:', error)
      toast.error('Failed to copy messages to new chat')
      return
    }

    // Switch to the new chat
    setActiveChatId(newChat.id)
    toast.success('Chat branched successfully!')
  }, [activeChatId, activeChat, messages, createChat, renameChat])

  // Auto-select first chat
  useEffect(() => {
    if (!chatsLoading && chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id)
    }
  }, [chatsLoading, chats, activeChatId])

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden text-foreground bg-background">
        
        {/* Left Sidebar (History) */}
        <div className={cn("flex flex-col border-r border-border bg-sidebar z-10 shrink-0 transition-all duration-300", sidebarCollapsed ? "w-0 border-0" : "w-64")}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4">
             <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground">Recent</span>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button variant="ghost" size="icon-sm" onClick={handleNewChat} className="size-7 text-sidebar-foreground/80 hover:text-sidebar-foreground">
                   <Plus className="size-4" />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>New chat (Ctrl+N)</TooltipContent>
             </Tooltip>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelect={handleSelectChat}
              onCreate={handleNewChat}
              onDelete={handleDeleteChat}
              onRename={renameChat}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        </div>

        {/* Main Content Area (Chat + Split View) */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
           {/* Top Header */}
           <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 bg-background/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon-sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="size-8 text-muted-foreground">
                       <LayoutTemplate className="size-4" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>Toggle Sidebar</TooltipContent>
                 </Tooltip>
                 <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-3 py-1.5 shadow-sm ml-2">
                    <Zap className="size-3.5 text-primary" />
                    <span className="text-sm font-bold tracking-wide">CODEBOLT</span>
                 </div>
                 <div className="ml-2">
                    <ModelSelector
                       value={activeModel}
                       onChange={handleModelChange}
                       disabled={!activeChatId || isStreaming}
                     />
                 </div>
                 {isStreaming && (
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs shadow-sm ml-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-muted-foreground">Generating…</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="icon-sm"
                       onClick={handleExportChat}
                       disabled={!activeChatId || messages.length === 0}
                       className="size-8 text-muted-foreground hover:text-foreground"
                     >
                       <DownloadCloud className="size-4" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>Export Chat</TooltipContent>
                 </Tooltip>
                 <SettingsPanel settings={settings} onChange={setSettings} disabled={isStreaming} />
                 <Button variant="ghost" size="icon-sm" onClick={handleLogout} className="size-8 text-muted-foreground hover:text-foreground">
                   <LogOut className="size-4" />
                 </Button>
              </div>
           </div>

           {/* Workspace Area */}
           <div className="flex flex-1 overflow-hidden">
             
             {/* Center Chat Area */}
             <div className="flex flex-1 flex-col h-full items-center bg-background/50">
                <div className="w-full max-w-4xl flex-1 flex flex-col relative">
                   <ChatArea
                     messages={messages}
                     isStreaming={isStreaming}
                     streamingContent={streamingContent}
                     chatId={activeChatId}
                     onRegenerate={handleRegenerate}
                     onPreview={(code) => setPreviewCode(code)}
                     onFork={handleForkChat}
                   />
                   <div className="px-4 pb-6 w-full">
                     <ChatInput
                       onSend={handleSend}
                       onStop={stopStreaming}
                       isStreaming={isStreaming}
                       disabled={!activeChatId}
                       placeholder={
                         activeChatId
                           ? 'Message CODEBOLT...'
                           : 'Create a new chat...'
                       }
                     />
                   </div>
                </div>
             </div>

             {/* Right Artifact Panel */}
             {previewCode && (
               <div className="w-[50%] border-l border-border/60 flex flex-col h-full bg-background shadow-2xl shrink-0 transition-all">
                 <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4 bg-muted/10">
                   <div className="flex items-center gap-2">
                     <Code2 className="size-4 text-blue-400" />
                     <span className="text-sm font-medium">Artifact Preview</span>
                   </div>
                   <Button variant="ghost" size="icon-sm" onClick={() => setPreviewCode(null)} className="size-7 text-muted-foreground">
                     <X className="size-4" />
                   </Button>
                 </div>
                 <div className="flex-1 overflow-hidden relative">
                   <CodePreviewPanel code={previewCode} onClose={() => setPreviewCode(null)} />
                 </div>
               </div>
             )}

           </div>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
