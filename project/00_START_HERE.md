# 🚀 CODEBOLT - START HERE

Welcome! CODEBOLT is ready to use. This file has everything you need.

## What Is CODEBOLT?

An ultra-fast ChatGPT-style coding assistant web app built with:
- React + TypeScript + Vite
- NVIDIA NIM API (8 AI models)
- Supabase database
- shadcn/ui components
- Dark mode by default

## Files You Have

✅ **codebolt-src.zip** (140 KB) — Everything you need
✅ **All documentation** — Setup, usage, features
✅ **Production-ready code** — Tested and verified

## Getting Started (5 Minutes)

### Step 1: Extract
```bash
unzip codebolt-src.zip
cd project
```

### Step 2: Install
```bash
npm install
```

### Step 3: Get API Key
1. Go to https://integrate.api.nvidia.com
2. Sign up (free)
3. Get your API key
4. Edit `.env` file:
   ```
   VITE_NVIDIA_API_KEY=nvapi-your-key-here
   ```

### Step 4: Run
```bash
npm run dev
```

### Step 5: Use
Open http://localhost:5173 and start chatting!

## What You Can Do

- Write code in 8+ different AI models
- Save chat history
- Change temperature and token limits
- Copy code blocks
- Stop generating responses
- Regenerate answers
- Dark mode (always on)
- Keyboard shortcuts (Ctrl+N = new chat)

## Documentation

- **QUICKSTART.md** — 5-minute setup guide
- **README.md** — Full feature list
- **DOWNLOAD_GUIDE.md** — Installation help
- **BUILD_SUMMARY.md** — What was built

## Troubleshooting

### "API key not configured"
Add `VITE_NVIDIA_API_KEY` to `.env` file

### "Cannot connect to database"  
Check `.env` has Supabase credentials

### "npm install fails"
Try: `rm -rf node_modules && npm install`

## Next Steps

1. ✅ Download codebolt-src.zip
2. ✅ Extract and run npm install
3. ✅ Add NVIDIA API key
4. ✅ Run npm run dev
5. ✅ Create a chat and start coding!

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** NVIDIA NIM APIs
- **Icons:** Lucide React

## Deploy to Production

```bash
npm run build
# Then deploy dist/ folder to Vercel, Netlify, or your server
```

## Support

- **NVIDIA NIM:** https://nvidia.com/nim
- **Supabase:** https://supabase.com
- **React:** https://react.dev

---

**Ready?** Follow the "Getting Started" section above and you'll have CODEBOLT running in 5 minutes!
