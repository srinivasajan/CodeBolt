# CODEBOLT Quick Start

Get CODEBOLT running in 5 minutes.

## Step 1: Add Your NVIDIA API Key

1. Get your key from https://integrate.api.nvidia.com (free account)
2. Edit `.env` file:
   ```
   VITE_SUPABASE_URL=https://cqtazykadfynvrxokynq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_NVIDIA_API_KEY=nvapi-your-key-here
   ```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Step 4: Start Chatting

1. Click **"New Chat"** button
2. Pick a model (top toolbar)
3. Type your question
4. Press **Enter** or click Send

## Features to Try

- **Model Switching** — Click model name to switch (instant)
- **Settings** — Click gear icon for temperature/tokens/system prompt
- **Regenerate** — Hover over AI response, click refresh icon
- **Stop** — Click red stop button while generating
- **Rename Chat** — Hover over sidebar chat, click pencil
- **Keyboard Shortcuts** — `Ctrl+N` for new chat, `Ctrl+B` to collapse sidebar

## Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# Push to GitHub, connect to Vercel
# Add env vars in dashboard
# Done!
```

### Option 2: Self-Host

```bash
npm run build
npm run preview
# Or use Docker/Kubernetes
```

## Troubleshooting

**"NVIDIA API error"** → Add API key to `.env` and restart

**"Cannot connect to database"** → Check Supabase credentials in `.env`

**"Build fails"** → Run `npm install && npm run build`

## Next Steps

- Modify system prompt in settings
- Adjust temperature for different response styles
- Create keyboard shortcut for frequently used prompts
- Deploy to production

Happy coding!
