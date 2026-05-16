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
    id: 'mistralai/mistral-small-4-119b-2603',
    name: 'Mistral Small 4 119B',
    description: 'Current free-endpoint coding model',
    contextLength: 128000,
  },
  {
    id: 'deepseek-ai/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Fast coding and agent model',
    contextLength: 128000,
  },
  {
    id: 'deepseek-ai/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Higher-quality long-context coding model',
    contextLength: 128000,
  },
  {
    id: 'z-ai/glm-5.1',
    name: 'GLM 5.1',
    description: 'Agentic reasoning and coding model',
    contextLength: 131072,
  },
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'Large-context multimodal assistant',
    contextLength: 131072,
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b',
    name: 'Nemotron 3 Super 120B',
    description: 'NVIDIA reasoning and planning model',
    contextLength: 131072,
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    name: 'Nemotron 3 Nano Omni',
    description: 'Multimodal reasoning model',
    contextLength: 131072,
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'Gemma 4 31B',
    description: 'Google instruction model for coding',
    contextLength: 131072,
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision',
    description: 'Multimodal vision model for image understanding',
    contextLength: 128000,
  },
]

export const DEFAULT_SETTINGS: ChatSettings = {
  temperature: 0.6,
  maxTokens: 4096,
  systemPrompt:
    'You are CODEBOLT, an expert coding assistant. You provide precise, efficient, and production-ready code solutions. Format all code in markdown code blocks with proper language tags.',
}
