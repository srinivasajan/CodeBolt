import type { Message, ChatSettings } from '@/types'

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1'

export interface NvidiaMessage {
  role: string
  content: string
}

export async function streamChat(
  messages: NvidiaMessage[],
  model: string,
  settings: ChatSettings,
  signal?: AbortSignal,
  onChunk?: (text: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY as string

  if (!apiKey) {
    onError?.(new Error('NVIDIA API key not configured. Add VITE_NVIDIA_API_KEY to your .env file.'))
    return
  }

  const systemMessage: NvidiaMessage = {
    role: 'system',
    content: settings.systemPrompt,
  }

  const allMessages = [systemMessage, ...messages]

  try {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NVIDIA API error ${response.status}: ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) onChunk?.(delta)
        } catch {
          // skip malformed chunks
        }
      }
    }

    onDone?.()
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}

export function messagesToNvidia(messages: Message[]): NvidiaMessage[] {
  return messages.map((m) => ({ role: m.role, content: m.content }))
}
