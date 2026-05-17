import type { VirtualFile } from '@/hooks/useProjectFiles'

/**
 * Parses an AI response for file edits using the <edit_file> tag format.
 * Returns an array of { path, content } objects for each edited file.
 *
 * Format the AI should use:
 *   <edit_file path="src/components/Foo.tsx">
 *   // full new file content here
 *   </edit_file>
 */
export interface FileEdit {
  path: string
  content: string
}

export function parseFileEdits(response: string): FileEdit[] {
  const edits: FileEdit[] = []
  // Match <edit_file path="...">...</edit_file> — including multiline content
  const regex = /<edit_file\s+path=["']([^"']+)["'][^>]*>([\s\S]*?)<\/edit_file>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(response)) !== null) {
    const path = match[1].trim()
    const content = match[2]
      // Strip leading/trailing newlines that appear right after the tag
      .replace(/^\n/, '')
      .replace(/\n$/, '')
    edits.push({ path, content })
  }
  return edits
}

/**
 * Builds the system prompt suffix that tells the AI about the current project
 * and how to output file edits so we can auto-apply them.
 */
export function buildProjectSystemPrompt(files: VirtualFile[]): string {
  if (files.length === 0) return ''

  const fileList = files
    .map(f => `  - ${f.path}`)
    .join('\n')

  return `\n\n---\n## Active Project: ${files.length} files loaded\n\nFiles in the current project:\n${fileList}\n\n### CRITICAL INSTRUCTION — FILE EDITING\nWhen the user asks you to edit, modify, refactor, fix, or update any file in the project, you MUST output the COMPLETE new content of every changed file using EXACTLY this XML format:\n\n<edit_file path="path/to/file.ext">\n[complete new file content — no truncation, no placeholders]\n</edit_file>\n\nRules:\n- Output the FULL file content every time, even if only one line changed.\n- Use the exact file path as shown in the project file list above.\n- You may output multiple <edit_file> blocks if you are editing multiple files.\n- After the edit blocks, briefly explain what you changed and why.\n- NEVER say "I cannot edit files directly" — you CAN by using the <edit_file> format above.\n---`
}

/**
 * Returns the content of a file from the project for injection into context.
 * Truncates very large files to avoid context overflow.
 */
export function buildFileContext(files: VirtualFile[], maxCharsPerFile = 8000): string {
  if (files.length === 0) return ''
  
  const sections = files.map(f => {
    const content = f.content.length > maxCharsPerFile
      ? f.content.slice(0, maxCharsPerFile) + '\n... [truncated for context]'
      : f.content
    return `### ${f.path}\n\`\`\`\n${content}\n\`\`\``
  })

  return `\n\n## Project File Contents\n\n${sections.join('\n\n')}`
}
