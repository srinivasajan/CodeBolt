# CODEBOLT Download & Installation Guide

## Download Options

You have **two files** ready to download:

### Option 1: Source Code Only (Recommended) — 140 KB
**File:** `codebolt-src.zip`

Contains all source files, configs, and documentation. Perfect for:
- Fresh installations
- Git repositories
- Minimal download

**What's included:**
- All TypeScript source files (`.tsx`, `.ts`)
- Configuration files (`vite.config.ts`, `tsconfig.json`, etc)
- Documentation (`README.md`, `QUICKSTART.md`)
- Environment templates (`.env.example`)
- Package dependencies list (`package.json`, `package-lock.json`)

**After downloading:**
```bash
unzip codebolt-src.zip
cd project
npm install
npm run dev
```

### Option 2: Complete Archive (With node_modules) — 48 MB
**File:** `codebolt-complete.tar.gz`

Contains the entire project including dependencies.

**After downloading:**
```bash
tar -xzf codebolt-complete.tar.gz
cd project
npm run dev
```

## Quick Start (5 Minutes)

### 1. Download & Extract
```bash
# If using source zip (recommended)
unzip codebolt-src.zip
cd project

# OR if using complete archive
tar -xzf codebolt-complete.tar.gz
cd project
```

### 2. Add NVIDIA API Key
Edit `.env` file:
```
VITE_SUPABASE_URL=https://cqtazykadfynvrxokynq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_NVIDIA_API_KEY=nvapi-your-key-here
```

Get your NVIDIA API key from: https://integrate.api.nvidia.com

### 3. Install Dependencies (if using source zip)
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## What's Included

### Core Files
```
src/
├── App.tsx                    # Main application
├── main.tsx                   # React entry point
├── components/
│   ├── ChatArea.tsx          # Message display
│   ├── ChatInput.tsx         # Input area
│   ├── ChatSidebar.tsx       # Chat history sidebar
│   ├── CodeBlock.tsx         # Syntax-highlighted code
│   ├── MessageBubble.tsx     # Message rendering
│   ├── ModelSelector.tsx     # AI model picker
│   ├── SettingsPanel.tsx     # Temperature/tokens settings
│   ├── theme-provider.tsx    # Dark mode provider
│   └── mode-toggle.tsx       # Theme toggle
├── hooks/
│   ├── useChats.ts           # Chat CRUD operations
│   └── useMessages.ts        # Message streaming
├── lib/
│   ├── supabase.ts           # Database client
│   ├── nvidia.ts             # NVIDIA NIM API client
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript types & model configs
└── components/ui/            # shadcn/ui components (60+ components)
```

### Configuration Files
- `vite.config.ts` — Vite build configuration
- `tsconfig.json` — TypeScript configuration
- `components.json` — shadcn/ui configuration
- `tailwind.config.js` — Tailwind CSS configuration
- `package.json` — Dependencies and scripts

### Documentation
- `README.md` — Full feature documentation
- `QUICKSTART.md` — 5-minute setup guide
- `BUILD_SUMMARY.md` — What was built
- `DOWNLOAD_GUIDE.md` — This file

### Environment
- `.env` — Pre-configured Supabase keys
- `.env.example` — Template for new installations

## Features Implemented

### Chat Management
- Create/delete/rename chats
- Auto-title from first message
- Persistent history (Supabase)
- Grouped by date (Today/Yesterday/etc)

### AI Features
- 8 NVIDIA model selector (instant switching)
- Streaming responses
- Stop generating button
- Regenerate last response
- Temperature & token controls
- Custom system prompts

### Message Features
- Full Markdown support
- Syntax-highlighted code blocks
- Copy buttons (code and text)
- Auto-scroll to new messages
- User/assistant message bubbles

### UI/UX
- Dark mode (default)
- Fully responsive
- Keyboard shortcuts (Ctrl+N, Ctrl+B)
- Hover actions on messages
- Loading indicators

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **AI API:** NVIDIA NIM
- **Streaming:** Fetch API with AbortController
- **Markdown:** React Markdown + Remark GFM
- **Icons:** Lucide React

## System Requirements

- Node.js 18+ (or higher)
- npm or yarn
- 200 MB disk space (source code)
- 600 MB disk space (with node_modules)
- Modern web browser

## Project Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# TypeScript check
npm run typecheck
```

## Database Setup

Database tables are automatically created. Schema:

```sql
chats
  ├── id (UUID, primary key)
  ├── title (text)
  ├── model (text)
  ├── created_at (timestamp)
  └── updated_at (timestamp)

messages
  ├── id (UUID, primary key)
  ├── chat_id (UUID, foreign key → chats.id)
  ├── role (text: 'user' | 'assistant')
  ├── content (text)
  └── created_at (timestamp)
```

## Troubleshooting

### "API key not configured"
Add `VITE_NVIDIA_API_KEY` to `.env` and restart dev server.

### "Cannot connect to Supabase"
Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

### "npm install fails"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Build fails"
```bash
npm run typecheck  # Check TypeScript errors
npm install        # Reinstall dependencies
npm run build      # Try building again
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

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

### Self-Hosted
```bash
npm install
npm run build
npm run preview
```

## Support & Resources

- **NVIDIA NIM:** https://nvidia.com/nim
- **Supabase Docs:** https://supabase.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **React:** https://react.dev
- **Vite:** https://vitejs.dev

## License

MIT

---

**Ready to start?** Download `codebolt-src.zip` and follow the Quick Start section above!
