/**
 * Monaco Theme Generator
 *
 * Generates Monaco editor theme definitions from VSCode themes.
 */

import type { MonacoThemeDefinition, VSCodeTheme, VSCodeTokenColor } from './types'

/**
 * Remove the leading # from a hex color.
 * Monaco expects hex colors without the # prefix.
 * @param hex - Hex color string
 * @returns Hex color without #
 */
function stripHash(hex: string): string {
  return hex.replace(/^#/, '')
}

/**
 * Map VSCode token scope to Monaco token.
 * VSCode and Monaco have slightly different token naming conventions.
 * @param scope - VSCode scope
 * @returns Monaco token or null if no mapping
 */
function mapVSCodeScopeToMonaco(scope: string): string | null {
  // Common mappings
  const mappings: Record<string, string> = {
    // Comments
    comment: 'comment',
    'comment.line': 'comment',
    'comment.block': 'comment',

    // Strings
    string: 'string',
    'string.quoted': 'string',
    'string.quoted.single': 'string',
    'string.quoted.double': 'string',
    'string.template': 'string',

    // Numbers
    'constant.numeric': 'number',
    constant: 'number',

    // Keywords
    keyword: 'keyword',
    'keyword.control': 'keyword',
    'keyword.operator': 'keyword',
    'storage.type': 'keyword',
    storage: 'keyword',

    // Variables
    variable: 'variable',
    'variable.parameter': 'variable.parameter',
    'variable.other': 'variable',

    // Functions
    'entity.name.function': 'function',
    'support.function': 'function',

    // Classes and types
    'entity.name.class': 'type',
    'entity.name.type': 'type',
    'support.type': 'type',
    'support.class': 'type',

    // Tags (HTML, XML)
    'entity.name.tag': 'tag',
    'punctuation.definition.tag': 'delimiter.html',

    // Attributes
    'entity.other.attribute-name': 'attribute.name',

    // Operators
    'keyword.operator.assignment': 'operator',
    'keyword.operator.arithmetic': 'operator',
    'keyword.operator.logical': 'operator',

    // Regex
    'string.regexp': 'regexp',

    // SQL specific
    'keyword.other.DML.sql': 'keyword',
    'keyword.other.DDL.sql': 'keyword',
    'string.quoted.single.sql': 'string.sql',
  }

  // Direct mapping
  if (mappings[scope]) {
    return mappings[scope]
  }

  // Try prefix matching
  for (const [vsScope, monacoToken] of Object.entries(mappings)) {
    if (scope.startsWith(vsScope)) {
      return monacoToken
    }
  }

  return null
}

/**
 * Convert VSCode tokenColors to Monaco rules.
 * @param tokenColors - VSCode token colors
 * @returns Monaco rules array
 */
function convertTokenColors(
  tokenColors: VSCodeTokenColor[]
): MonacoThemeDefinition['rules'] {
  const rules: MonacoThemeDefinition['rules'] = []
  const processedTokens = new Set<string>()

  for (const token of tokenColors) {
    const scopes = Array.isArray(token.scope) ? token.scope : [token.scope]

    for (const scope of scopes) {
      const monacoToken = mapVSCodeScopeToMonaco(scope)
      if (monacoToken && !processedTokens.has(monacoToken)) {
        processedTokens.add(monacoToken)

        // Skip tokens without settings
        if (!token.settings) continue

        const rule: MonacoThemeDefinition['rules'][0] = {
          token: monacoToken,
        }

        if (token.settings.foreground) {
          rule.foreground = stripHash(token.settings.foreground)
        }

        if (token.settings.fontStyle) {
          rule.fontStyle = token.settings.fontStyle
        }

        rules.push(rule)
      }
    }
  }

  return rules
}

/**
 * Generate Monaco editor theme from VSCode theme.
 * @param theme - VSCode theme
 * @returns Monaco theme definition
 */
export function generateMonacoTheme(theme: VSCodeTheme): MonacoThemeDefinition {
  const isDark = theme.type === 'dark'
  const colors = theme.colors

  // Build rules from tokenColors
  const rules = theme.tokenColors ? convertTokenColors(theme.tokenColors) : []

  // Build editor colors
  const monacoColors: Record<string, string> = {}

  // Map VSCode colors to Monaco editor colors
  const colorMappings: Record<string, string> = {
    'editor.background': 'editor.background',
    'editor.foreground': 'editor.foreground',
    'editorLineNumber.foreground': 'editorLineNumber.foreground',
    'editorCursor.foreground': 'editorCursor.foreground',
    'editor.selectionBackground': 'editor.selectionBackground',
    'editor.lineHighlightBackground': 'editor.lineHighlightBackground',
    'editorIndentGuide.background': 'editorIndentGuide.background',
    'editorIndentGuide.activeBackground': 'editorIndentGuide.activeBackground',
    'editorWhitespace.foreground': 'editorWhitespace.foreground',
    'editorWidget.background': 'editorWidget.background',
    'editorWidget.border': 'editorWidget.border',
    'editorSuggestWidget.background': 'editorSuggestWidget.background',
    'editorSuggestWidget.foreground': 'editorSuggestWidget.foreground',
    'editorSuggestWidget.selectedBackground': 'editorSuggestWidget.selectedBackground',
    'editorSuggestWidget.highlightForeground': 'editorSuggestWidget.highlightForeground',
    'editorHoverWidget.background': 'editorHoverWidget.background',
    'editorHoverWidget.border': 'editorHoverWidget.border',
    'input.background': 'input.background',
    'input.foreground': 'input.foreground',
    'input.border': 'input.border',
    'dropdown.background': 'dropdown.background',
    'dropdown.foreground': 'dropdown.foreground',
    'dropdown.border': 'dropdown.border',
    focusBorder: 'focusBorder',
    'scrollbarSlider.background': 'scrollbarSlider.background',
    'scrollbarSlider.hoverBackground': 'scrollbarSlider.hoverBackground',
    'scrollbarSlider.activeBackground': 'scrollbarSlider.activeBackground',
  }

  for (const [vsCodeKey, monacoKey] of Object.entries(colorMappings)) {
    const color = colors[vsCodeKey]
    if (color) {
      monacoColors[monacoKey] = color
    }
  }

  return {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules,
    colors: monacoColors,
  }
}

/**
 * Generate a unique theme name for Monaco.
 * @param themeName - Original theme name
 * @returns Sanitized theme name for Monaco
 */
export function generateMonacoThemeName(themeName: string): string {
  return `vscode-${themeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}
