import type { VirtualFile } from '@/hooks/useProjectFiles'

export interface FileAction {
  type: 'edit' | 'delete'
  path: string
  content?: string
}

/**
 * Parses an AI response for file actions (edits and deletes).
 *
 * Edit Format:
 *   <edit_file path="src/components/Foo.tsx">
 *   // content
 *   </edit_file>
 *
 * Delete Format:
 *   <delete_file path="src/components/Foo.tsx" />
 */
export function parseFileActions(response: string): FileAction[] {
  const actions: FileAction[] = []

  // 1. Parse edits
  const editRegex = /<edit_file\s+path=["']([^"']+)["'][^>]*>([\s\S]*?)<\/edit_file>/gi
  let editMatch: RegExpExecArray | null
  while ((editMatch = editRegex.exec(response)) !== null) {
    const path = editMatch[1].trim()
    const content = editMatch[2]
      .replace(/^\n/, '')
      .replace(/\n$/, '')
    actions.push({ type: 'edit', path, content })
  }

  // 2. Parse deletes
  const deleteRegex = /<delete_file\s+path=["']([^"']+)["'][^>]*\/>/gi
  let deleteMatch: RegExpExecArray | null
  while ((deleteMatch = deleteRegex.exec(response)) !== null) {
    const path = deleteMatch[1].trim()
    actions.push({ type: 'delete', path })
  }

  return actions
}

/**
 * Builds the system prompt suffix that tells the AI about the current project
 * and how to output file edits and deletes so we can auto-apply them.
 */
export function buildProjectSystemPrompt(files: VirtualFile[]): string {
  if (files.length === 0) return ''

  const fileList = files
    .map(f => `  - ${f.path}`)
    .join('\n')

  return `\n\n---\n## Active Project: ${files.length} files loaded\n\nFiles in the current project:\n${fileList}\n\n### CRITICAL INSTRUCTION — FILE ACTIONS\nWhen the user asks you to edit, modify, refactor, fix, update, create, or delete any file in the project, you MUST output instructions in these exact XML formats:\n\n1. To EDIT or CREATE a file:\n<edit_file path="path/to/file.ext">\n[complete new file content — no truncation, no placeholders]\n</edit_file>\n\n2. To DELETE a file:\n<delete_file path="path/to/file.ext" />\n\nRules:\n- Output the FULL file content every time you edit a file, even if only one line changed.\n- Use the exact file path as shown in the project file list above.\n- You may output multiple edit/delete blocks in a single turn if needed.\n- After the blocks, briefly explain what you did and why.\n- NEVER say "I cannot edit files directly" — you CAN by using the XML tags above.\n---`
}
