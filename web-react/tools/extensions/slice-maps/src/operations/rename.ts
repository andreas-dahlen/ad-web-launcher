import * as vscode from 'vscode'

const MAX_NAME_LENGTH = 20

async function rename(prompt: string, placeholderString: string): Promise<string | null> {
  const name = await vscode.window.showInputBox({
    prompt,
    placeHolder: placeholderString,
    validateInput: value => {
      const trimmed = value.trim()

      if (!trimmed) return 'Name cannot be empty'
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `Name cannot exceed ${MAX_NAME_LENGTH} characters`
      }

      return null
    },
  })

  const trimmed = name?.trim()
  return trimmed || null
}

export function renameMap(): Promise<string | null> {
  return rename('Slice map name', 'Pizza Slice')
}

export function renameFilter(): Promise<string | null> {
  return rename('Slice filter name', 'Tortilla Filter')
}