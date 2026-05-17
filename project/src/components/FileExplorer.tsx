import { useState } from 'react'
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  FolderInput, RotateCcw, FolderPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { FileNode, VirtualFile } from '@/hooks/useProjectFiles'

interface FileExplorerProps {
  fileTree: FileNode[]
  projectName: string
  activeFilePath?: string | null
  onFileOpen: (file: VirtualFile) => void
  onOpenFolder: () => void
  onClearProject: () => void
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const colors: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400', js: 'text-yellow-400',
    jsx: 'text-yellow-400', json: 'text-yellow-600', css: 'text-blue-300',
    scss: 'text-pink-400', html: 'text-orange-400', md: 'text-gray-400',
    py: 'text-green-400', sh: 'text-green-300', yml: 'text-red-400',
    yaml: 'text-red-400', rs: 'text-orange-500', go: 'text-cyan-400',
    java: 'text-red-500', cpp: 'text-blue-500', c: 'text-blue-500',
  }
  return colors[ext] ?? 'text-muted-foreground'
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  activeFilePath?: string | null
  onFileOpen: (file: VirtualFile) => void
}

function TreeNode({ node, depth, activeFilePath, onFileOpen }: TreeNodeProps) {
  const [open, setOpen] = useState(depth === 0)

  if (node.type === 'file') {
    const isActive = node.file?.path === activeFilePath
    return (
      <button
        onClick={() => node.file && onFileOpen(node.file)}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-xs transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <FileText className={cn('size-3.5 shrink-0', getFileIcon(node.name))} />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 rounded-sm px-2 py-1 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
        )}
        {open ? (
          <FolderOpen className="size-3.5 shrink-0 text-yellow-400/80" />
        ) : (
          <Folder className="size-3.5 shrink-0 text-yellow-400/80" />
        )}
        <span className="font-medium truncate">{node.name}</span>
      </button>
      {open && node.children.map(child => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          activeFilePath={activeFilePath}
          onFileOpen={onFileOpen}
        />
      ))}
    </div>
  )
}

export function FileExplorer({
  fileTree,
  projectName,
  activeFilePath,
  onFileOpen,
  onOpenFolder,
  onClearProject,
}: FileExplorerProps) {
  const hasFiles = fileTree.length > 0

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3 bg-muted/10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {projectName || 'Explorer'}
        </span>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onOpenFolder}
                className="size-6 text-muted-foreground hover:text-foreground"
              >
                <FolderInput className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Folder / Upload ZIP</TooltipContent>
          </Tooltip>
          {hasFiles && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onClearProject}
                  className="size-6 text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close Project</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {!hasFiles ? (
        /* Empty State */
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
          <Folder className="size-12 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-foreground/60">No folder open</p>
            <p className="mt-1 text-xs text-muted-foreground">Upload a ZIP or open a folder</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFolder}
            className="mt-2 text-xs h-8 gap-2"
          >
            <FolderPlus className="size-3.5" />
            Open Folder / ZIP
          </Button>
        </div>
      ) : (
        /* File Tree */
        <ScrollArea className="flex-1">
          <div className="py-1">
            {fileTree.map(node => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                activeFilePath={activeFilePath}
                onFileOpen={onFileOpen}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
