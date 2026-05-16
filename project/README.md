# CODEBOLT — Ultra-Fast AI Coding Assistant

An ultra-fast, production-ready ChatGPT-style coding assistant built with React, TypeScript, Vite, and shadcn/ui. Powered by NVIDIA NIM APIs.

## Features

- **Streaming AI Responses** — Real-time response generation with stop/regenerate
- **8 NVIDIA Models** — Switch between Nemotron Ultra, SuperChat, Llama 4, DeepSeek, Gemma, QwQ, and Mistral
- **Chat History** — Persistent conversations with create/delete/rename
- **Markdown + Code Highlighting** — Full syntax support with copy buttons
- **Temperature & Token Controls** — Fine-tune generation behavior
- **Keyboard Shortcuts** — Ctrl+N (new chat), Ctrl+B (toggle sidebar)
- **Dark Mode** — Beautiful dark theme by default
- **Fully Responsive** — Works on desktop and tablet

## Setup

### 1. Get API Keys

**Supabase** (already configured):
- Database URL and anonymous key are in `.env`

**NVIDIA NIM** (required):
1. Go to https://integrate.api.nvidia.com
2. Sign up and get your API key
3. Add to `.env`:
   ```
   VITE_NVIDIA_API_KEY=nvapi-your-key-here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    ChatArea.tsx           # Message display & auto-scroll
    ChatInput.tsx          # Input with send/stop buttons
    ChatSidebar.tsx        # Chat history with sidebar
    CodeBlock.tsx          # Syntax-highlighted code
    MessageBubble.tsx      # User/assistant messages
    ModelSelector.tsx      # 8 NVIDIA model picker
    SettingsPanel.tsx      # Temperature, tokens, system prompt
  hooks/
    useChats.ts            # Chat CRUD operations
    useMessages.ts         # Message streaming & generation
  lib/
    supabase.ts            # Supabase client
    nvidia.ts              # NVIDIA NIM streaming service
  types/
    index.ts               # TypeScript types & model configs
  App.tsx                  # Main layout
  main.tsx                 # React entry point
```

## Database Schema

**Supabase** auto-synced tables:

```sql
chats (id, title, model, created_at, updated_at)
messages (id, chat_id, role, content, created_at)
```

RLS policies allow public read/write (no auth required).

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS v4 (OKLCH colors)
- **Database**: Supabase PostgreSQL
- **AI**: NVIDIA NIM Streaming API
- **Icons**: Lucide React
- **Markdown**: React Markdown + Remark GFM
- **Markdown**: React Markdown + Remark GFM
- **Forms**: React Hook Form + Zod

## Available Models

| Model | Provider | Context | Best For |
|-------|----------|---------|----------|
| Nemotron Ultra 253B | NVIDIA | 128k | Expert reasoning |
| Nemotron Super 49B | NVIDIA | 128k | Fast coding |
| Llama 4 Maverick 17B | Meta | 1M | Long context |
| Llama 4 Scout 17B | Meta | 1M | Quick tasks |
| DeepSeek R1 | DeepSeek | 128k | Complex problems |
| Gemma 3 27B | Google | 131k | General purpose |
| QwQ 32B | Qwen | 131k | Reasoning |
| Mistral Small 24B | Mistral | 131k | Efficient |

## Keyboard Shortcuts

- **Ctrl/Cmd + N** — New chat
- **Ctrl/Cmd + B** — Toggle sidebar
- **Shift + Enter** — Newline in input
- **Enter** — Send message

## Performance Optimizations

- **Lazy loaded components** — Reduces initial bundle
- **Streaming responses** — No wait for full response
- **Auto-scroll** — Smooth chat experience
- **Minimal re-renders** — Optimized React hooks
- **Production-grade caching** — Supabase query optimization

## Deployment

### Vercel (Recommended)

```bash
git push origin main
# Vercel auto-deploys
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NVIDIA_API_KEY`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## Troubleshooting

**"API key not configured"**
- Add `VITE_NVIDIA_API_KEY` to `.env`

**"Cannot read chats"**
- Check Supabase URL and anon key in `.env`

**Build errors**
- Run `npm install` and `npm run build` again
- Clear `node_modules` and reinstall if issues persist

## License

MIT

## Credits

Built with:
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [NVIDIA NIM](https://nvidia.com/nim)
- [Supabase](https://supabase.com)
