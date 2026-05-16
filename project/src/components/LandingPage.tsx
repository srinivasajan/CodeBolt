import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Code2, Database, Palette, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LandingPage() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [showApiInput, setShowApiInput] = useState(false)

  const handleStartBuild = () => {
    if (apiKey.trim()) {
      // Save API key to localStorage
      localStorage.setItem('VITE_NVIDIA_API_KEY', apiKey)
      navigate('/app')
    } else {
      setShowApiInput(true)
    }
  }

  const handleLaunchApp = () => {
    const savedKey = localStorage.getItem('VITE_NVIDIA_API_KEY')
    if (savedKey) {
      navigate('/app')
    } else {
      setShowApiInput(true)
    }
  }

  const handleContinueWithKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('VITE_NVIDIA_API_KEY', apiKey)
      navigate('/app')
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background to-background/80">
      {/* Animated background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl opacity-20" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">CODEBOLT</span>
          </div>
          <nav className="flex items-center gap-6 max-sm:hidden">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#models" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Models
            </a>
            <a href="https://github.com/srinivasajan/CodeBolt" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
            <Button onClick={handleLaunchApp} className="gap-2">
              Launch App <ArrowRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              Ultra-Fast AI Coding Assistant
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Production-ready ChatGPT-style interface powered by NVIDIA NIM APIs. Stream responses, switch models, and build faster than ever.
            </p>

            {/* API Key Input Section */}
            {showApiInput ? (
              <div className="mt-8 mx-auto max-w-md rounded-2xl border border-border/20 bg-card/50 p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold mb-3">Enter Your NVIDIA API Key</h3>
                <Input
                  type="password"
                  placeholder="api-key-xxx..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleContinueWithKey()
                    }
                  }}
                  className="mb-3"
                />
                <p className="text-xs text-muted-foreground mb-4">
                  Get your free API key from{' '}
                  <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    NVIDIA Build
                  </a>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowApiInput(false)
                      setApiKey('')
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContinueWithKey}
                    disabled={!apiKey.trim()}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" onClick={handleStartBuild} className="gap-2">
                  Start Building <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.open('https://github.com/srinivasajan/CodeBolt', '_blank')}>
                  View on GitHub
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/10 bg-gradient-to-b from-background/50 to-background py-20 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-16">
            Everything You Need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Streaming Responses',
                description: 'Real-time message generation with live cursor feedback. See answers as they\'re generated.',
              },
              {
                icon: Code2,
                title: 'Instant Model Switching',
                description: 'Choose from 8 NVIDIA models. Switch anytime to compare outputs and find the best fit.',
              },
              {
                icon: Database,
                title: 'Persistent Chat History',
                description: 'All conversations saved to Supabase. Create, rename, and organize chats effortlessly.',
              },
              {
                icon: Palette,
                title: 'Full Markdown Support',
                description: 'Syntax-highlighted code blocks, formatted text, and rich markdown in every response.',
              },
              {
                icon: Palette,
                title: 'Dark Mode by Default',
                description: 'Beautiful dark theme optimized for extended coding sessions. Toggle to light mode anytime.',
              },
              {
                icon: Smartphone,
                title: 'Fully Responsive',
                description: 'Works seamlessly on desktop, tablet, and mobile. Build and debug anywhere.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="group rounded-xl border border-border/20 bg-card/50 p-6 transition-all hover:bg-card/80 hover:border-border/40">
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-20 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-6">
            Powered by NVIDIA NIM
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Switch between cutting-edge AI models. Each with unique strengths for coding, analysis, and creative work.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Mistral Small 4 119B',
              'DeepSeek V4 Flash',
              'DeepSeek V4 Pro',
              'GLM 5.1',
              'Kimi K2.6',
              'Nemotron 3 Super 120B',
              'Nemotron 3 Nano Omni',
              'Gemma 4 31B',
            ].map((model) => (
              <div key={model} className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                {model}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/10 bg-gradient-to-b from-background to-background/50 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-8 sm:p-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Ready to Build?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start using CODEBOLT in seconds. No setup required—just your NVIDIA API key.
            </p>
            <Button size="lg" onClick={handleLaunchApp} className="gap-2">
              Launch the App <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">CODEBOLT</span>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/srinivasajan/CodeBolt" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="https://nvidia.com/nim" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                NVIDIA NIM
              </a>
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Supabase
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CODEBOLT. Built with React, TypeScript, Vite, and NVIDIA NIM.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
