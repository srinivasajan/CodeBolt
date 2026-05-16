import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Chat } from '@/types'
import { NVIDIA_MODELS } from '@/types'

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChats = useCallback(async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) setChats(data as Chat[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const createChat = useCallback(async (model?: string): Promise<Chat | null> => {
    const selectedModel = model ?? NVIDIA_MODELS[0].id
    const { data, error } = await supabase
      .from('chats')
      .insert({ title: 'New Chat', model: selectedModel })
      .select()
      .single()

    if (error || !data) return null
    const chat = data as Chat
    setChats((prev) => [chat, ...prev])
    return chat
  }, [])

  const deleteChat = useCallback(async (id: string) => {
    await supabase.from('chats').delete().eq('id', id)
    setChats((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const renameChat = useCallback(async (id: string, title: string) => {
    await supabase.from('chats').update({ title }).eq('id', id)
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
  }, [])

  const updateChatModel = useCallback(async (id: string, model: string) => {
    await supabase.from('chats').update({ model }).eq('id', id)
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, model } : c)))
  }, [])

  const updateChatTitle = useCallback((id: string, title: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
  }, [])

  return {
    chats,
    loading,
    createChat,
    deleteChat,
    renameChat,
    updateChatModel,
    updateChatTitle,
    refetch: fetchChats,
  }
}
