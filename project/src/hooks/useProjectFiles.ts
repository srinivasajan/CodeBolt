import { useState, useCallback, useMemo } from 'react'

export interface VirtualFile {
  path: string
  name: string
  content: string
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children: FileNode[]
  file?: VirtualFile
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    json: 'json', css: 'css', scss: 'scss', html: 'html', md: 'markdown',
    py: 'python', sh: 'bash', yml: 'yaml', yaml: 'yaml', txt: 'text',
    rs: 'rust', go: 'go', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
    rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin', sql: 'sql',
  }
  return map[ext] ?? 'text'
}

export function buildFileTree(files: VirtualFile[]): FileNode[] {
  const root: FileNode = { name: '', path: '', type: 'dir', children: [] }

  for (const file of files) {
    const parts = file.path.replace(/^\//, '').split('/')
    let node = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      let child = node.children.find(c => c.name === part)

      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: isLast ? 'file' : 'dir',
          children: [],
          file: isLast ? file : undefined,
        }
        node.children.push(child)
      }
      node = child
    }
  }

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(root.children)

  return root.children
}

export function useProjectFiles() {
  const [files, setFiles] = useState<Record<string, VirtualFile>>({})
  const [activeFile, setActiveFile] = useState<VirtualFile | null>(null)
  const [projectName, setProjectName] = useState<string>('')

  const loadFiles = useCallback((newFiles: VirtualFile[], name: string) => {
    const map: Record<string, VirtualFile> = {}
    newFiles.forEach(f => { map[f.path] = f })
    setFiles(map)
    setProjectName(name)
    // Auto-open first non-directory file
    const firstFile = newFiles.find(f => !f.path.endsWith('/'))
    if (firstFile) setActiveFile(firstFile)
  }, [])

  const openFile = useCallback((path: string, allFiles?: Record<string, VirtualFile>) => {
    const source = allFiles ?? files
    const file = source[path]
    if (file) setActiveFile(file)
  }, [files])

  const updateFile = useCallback((path: string, content: string) => {
    let resolvedKey: string | null = null
    setFiles(prev => {
      if (prev[path]) {
        resolvedKey = path
        return { ...prev, [path]: { ...prev[path], content } }
      }
      const fuzzyKey = Object.keys(prev).find(k =>
        k.endsWith('/' + path) || k === path || k.endsWith(path)
      )
      if (fuzzyKey) {
        resolvedKey = fuzzyKey
        return { ...prev, [fuzzyKey]: { ...prev[fuzzyKey], content } }
      }
      // New file
      resolvedKey = path
      const name = path.split('/').pop() ?? path
      return { ...prev, [path]: { path, name, content } }
    })
    // Update activeFile separately — cannot call setState inside setState updater
    setActiveFile(prev => {
      if (!resolvedKey) return prev
      return prev?.path === resolvedKey ? { ...prev, content } : prev
    })
  }, [])

  const clearProject = useCallback(() => {
    setFiles({})
    setActiveFile(null)
    setProjectName('')
  }, [])

  const fileTree = useMemo(() => buildFileTree(Object.values(files)), [files])
  const fileList = useMemo(() => Object.values(files), [files])

  return {
    files,
    fileList,
    fileTree,
    activeFile,
    projectName,
    loadFiles,
    openFile,
    updateFile,
    clearProject,
    setActiveFile,
    getLanguage,
  }
}
