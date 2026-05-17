import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import type { VirtualFile } from '@/hooks/useProjectFiles'

interface CodeEditorProps {
  file: VirtualFile | null
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX',
    json: 'JSON', css: 'CSS', scss: 'SCSS', html: 'HTML', md: 'Markdown',
    py: 'Python', sh: 'Bash', yml: 'YAML', yaml: 'YAML', txt: 'Plain Text',
    rs: 'Rust', go: 'Go', java: 'Java', cpp: 'C++', c: 'C', cs: 'C#',
    rb: 'Ruby', php: 'PHP', swift: 'Swift', kt: 'Kotlin', sql: 'SQL',
  }
  return map[ext] ?? 'Text'
}

function getFileBadgeColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400', js: 'text-yellow-400',
    jsx: 'text-yellow-400', json: 'text-yellow-600', css: 'text-blue-300',
    scss: 'text-pink-400', html: 'text-orange-400', md: 'text-gray-400',
    py: 'text-green-400', rs: 'text-orange-500', go: 'text-cyan-400',
  }
  return map[ext] ?? 'text-muted-foreground'
}

export function CodeEditor({ file }: CodeEditorProps) {
  const lines = useMemo(() => file?.content.split('\n') ?? [], [file?.content])
  const language = file ? detectLanguage(file.name) : ''

  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground/20 select-none bg-background">
        <div className="text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/30 bg-muted/10 mx-auto">
            <FileText className="size-10 opacity-30" />
          </div>
          <p className="text-sm font-medium tracking-wide opacity-50">No file open</p>
          <p className="mt-1 text-xs opacity-30">Select a file from the Explorer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background font-mono text-sm">
      {/* File info bar */}
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border/40 bg-muted/10 px-4">
        <FileText className={`size-3.5 ${getFileBadgeColor(file.name)}`} />
        <span className="text-xs text-foreground/70 font-medium">{file.path}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
            {language}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {lines.length} lines
          </span>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div
            className="select-none border-r border-border/30 bg-muted/5 px-3 py-4 text-right text-xs text-muted-foreground/40 leading-6 shrink-0"
            style={{ minWidth: `${String(lines.length).length * 8 + 24}px` }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code */}
          <pre className="flex-1 overflow-x-auto px-4 py-4 text-xs leading-6 text-foreground/85 whitespace-pre">
            <code>{file.content}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
