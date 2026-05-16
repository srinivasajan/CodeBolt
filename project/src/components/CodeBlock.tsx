import { useState, useCallback } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  language?: string
  children: string
  className?: string
  onPreview?: (code: string) => void
}

const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rs: 'Rust',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  fish: 'Fish',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  xml: 'XML',
  dockerfile: 'Dockerfile',
  swift: 'Swift',
  kotlin: 'Kotlin',
  rb: 'Ruby',
  ruby: 'Ruby',
  php: 'PHP',
  r: 'R',
  lua: 'Lua',
}

function highlightCode(code: string, _language: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

import { Play } from 'lucide-react'

export function CodeBlock({ language = 'text', children, className, onPreview }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [children])

  const label = LANGUAGE_LABELS[language.toLowerCase()] ?? language
  const isPreviewable = ['jsx', 'tsx', 'js', 'ts', 'html'].includes(language.toLowerCase()) && onPreview

  return (
    <div className={cn('group relative my-4 overflow-hidden rounded-lg border border-border bg-muted/30', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            {label || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isPreviewable && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onPreview!(children)}
              className="size-6 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-emerald-400 hover:bg-emerald-500/10"
              title="Run Preview"
            >
              <Play className="size-3 fill-current" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={copy}
            className="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            title="Copy Code"
          >
            {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="px-4 py-3 text-sm leading-relaxed">
          <code
            className={cn('font-mono text-foreground/90', `language-${language}`)}
            dangerouslySetInnerHTML={{ __html: highlightCode(children, language) }}
          />
        </pre>
      </div>
    </div>
  )
}
