/**
 * VSCode Theme Types
 *
 * Type definitions for VSCode theme parsing and mapping to Supabase CSS variables.
 */

/**
 * VSCode token color definition for syntax highlighting
 */
export interface VSCodeTokenColor {
  name?: string
  scope: string | string[]
  settings: {
    foreground?: string
    fontStyle?: string
  }
}

/**
 * VSCode theme structure (subset of full VSCode theme format)
 */
export interface VSCodeTheme {
  name: string
  type: 'dark' | 'light'
  colors: {
    // Editor colors
    'editor.background'?: string
    'editor.foreground'?: string
    'editorLineNumber.foreground'?: string
    'editorCursor.foreground'?: string
    'editor.selectionBackground'?: string
    'editor.lineHighlightBackground'?: string

    // Sidebar colors
    'sideBar.background'?: string
    'sideBar.foreground'?: string
    'sideBarTitle.foreground'?: string
    'sideBarSectionHeader.background'?: string

    // Activity bar colors
    'activityBar.background'?: string
    'activityBar.foreground'?: string
    'activityBarBadge.background'?: string

    // Panel colors
    'panel.background'?: string
    'panel.border'?: string
    'panelTitle.activeBorder'?: string
    'panelTitle.activeForeground'?: string
    'panelTitle.inactiveForeground'?: string

    // Input colors
    'input.background'?: string
    'input.foreground'?: string
    'input.border'?: string
    'input.placeholderForeground'?: string

    // Dropdown colors
    'dropdown.background'?: string
    'dropdown.border'?: string
    'dropdown.foreground'?: string

    // Button colors
    'button.background'?: string
    'button.foreground'?: string
    'button.hoverBackground'?: string

    // List colors
    'list.activeSelectionBackground'?: string
    'list.activeSelectionForeground'?: string
    'list.hoverBackground'?: string
    'list.inactiveSelectionBackground'?: string

    // Tab colors
    'tab.activeBackground'?: string
    'tab.activeForeground'?: string
    'tab.inactiveBackground'?: string
    'tab.inactiveForeground'?: string
    'tab.border'?: string

    // Title bar colors
    'titleBar.activeBackground'?: string
    'titleBar.activeForeground'?: string
    'titleBar.inactiveBackground'?: string
    'titleBar.inactiveForeground'?: string

    // Status bar colors
    'statusBar.background'?: string
    'statusBar.foreground'?: string
    'statusBar.border'?: string

    // Terminal colors
    'terminal.background'?: string
    'terminal.foreground'?: string

    // Notification colors
    'notificationCenter.border'?: string
    'notifications.background'?: string
    'notifications.border'?: string

    // Badge colors
    'badge.background'?: string
    'badge.foreground'?: string

    // Scroll bar colors
    'scrollbarSlider.background'?: string
    'scrollbarSlider.hoverBackground'?: string
    'scrollbarSlider.activeBackground'?: string

    // Focus border
    focusBorder?: string

    // Foreground
    foreground?: string

    // Error/Warning colors
    'errorForeground'?: string

    // Widget colors
    'widget.shadow'?: string

    // Text link colors
    'textLink.foreground'?: string
    'textLink.activeForeground'?: string

    // Allow additional colors
    [key: string]: string | undefined
  }
  tokenColors?: VSCodeTokenColor[]
}

/**
 * Supabase CSS variable structure (HSL format)
 */
export interface SupabaseThemeVariables {
  // Background variables
  '--background-default': string
  '--background-alternative': string
  '--background-selection': string
  '--background-control': string
  '--background-surface-100': string
  '--background-surface-200': string
  '--background-surface-300': string
  '--background-overlay-default': string
  '--background-overlay-hover': string
  '--background-muted': string

  // Foreground variables
  '--foreground-default': string
  '--foreground-light': string
  '--foreground-lighter': string
  '--foreground-muted': string

  // Border variables
  '--border-default': string
  '--border-muted': string
  '--border-secondary': string
  '--border-overlay': string
  '--border-control': string
  '--border-alternative': string
  '--border-strong': string
  '--border-stronger': string

  // Brand variables
  '--brand-default': string
  '--brand-accent': string
  '--brand-200': string
  '--brand-300': string
  '--brand-400': string
  '--brand-500': string
  '--brand-600': string
  '--brand-link': string

  // Code block colors (for syntax highlighting)
  '--code-block-1': string
  '--code-block-2': string
  '--code-block-3': string
  '--code-block-4': string
  '--code-block-5': string
}

/**
 * VSCode theme preset definition
 */
export interface VSCodeThemePreset {
  id: string
  name: string
  theme: VSCodeTheme
  preview: {
    background: string
    foreground: string
    accent: string
    surface: string
  }
}

/**
 * Monaco editor theme definition
 */
export interface MonacoThemeDefinition {
  base: 'vs-dark' | 'vs' | 'hc-black'
  inherit: boolean
  rules: Array<{
    token: string
    foreground?: string
    background?: string
    fontStyle?: string
  }>
  colors: {
    [key: string]: string
  }
}

/**
 * VSCode theme state for the hook
 */
export interface VSCodeThemeState {
  isEnabled: boolean
  presetId: string | null
  customThemeJson: string | null
}

/**
 * Result of theme parsing
 */
export interface ThemeParseResult {
  success: boolean
  theme?: VSCodeTheme
  error?: string
}
