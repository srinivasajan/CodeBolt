export type Role = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  chat_id: string
  role: Role
  content: string
  created_at: string
}

export interface Chat {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface Model {
  id: string
  name: string
  description: string
  contextLength: number
}

export interface ChatSettings {
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export const NVIDIA_MODELS: Model[] = [
  {
    id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    name: 'Nemotron Ultra 253B',
    description: 'NVIDIA flagship reasoning model',
    contextLength: 128000,
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1',
    name: 'Nemotron Super 49B',
    description: 'Fast & powerful coding model',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick 17B',
    description: 'Meta Llama 4 instruct model',
    contextLength: 1048576,
  },
  {
    id: 'meta/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    description: 'Meta fast scout model',
    contextLength: 1048576,
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning model',
    contextLength: 128000,
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3 27B',
    description: "Google's open model",
    contextLength: 131072,
  },
  {
    id: 'qwen/qwq-32b',
    name: 'QwQ 32B',
    description: 'Qwen reasoning model',
    contextLength: 131072,
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct',
    name: 'Mistral Small 24B',
    description: 'Mistral efficient model',
    contextLength: 131072,
  },
]

export const DEFAULT_SETTINGS: ChatSettings = {
  temperature: 0.6,
  maxTokens: 4096,
  systemPrompt:
    'You are CODEBOLT, an expert coding assistant. You provide precise, efficient, and production-ready code solutions. Format all code in markdown code blocks with proper language tags.',
}
