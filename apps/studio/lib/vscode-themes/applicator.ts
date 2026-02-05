/**
 * VSCode Theme Applicator
 *
 * Functions to apply theme variables to the DOM.
 */

import type { SupabaseThemeVariables } from './types'

/**
 * CSS variable keys that we manage
 */
const MANAGED_CSS_VARIABLES: (keyof SupabaseThemeVariables)[] = [
  // Background
  '--background-default',
  '--background-alternative',
  '--background-selection',
  '--background-control',
  '--background-surface-100',
  '--background-surface-200',
  '--background-surface-300',
  '--background-overlay-default',
  '--background-overlay-hover',
  '--background-muted',
  // Foreground
  '--foreground-default',
  '--foreground-light',
  '--foreground-lighter',
  '--foreground-muted',
  // Border
  '--border-default',
  '--border-muted',
  '--border-secondary',
  '--border-overlay',
  '--border-control',
  '--border-alternative',
  '--border-strong',
  '--border-stronger',
  // Brand
  '--brand-default',
  '--brand-accent',
  '--brand-200',
  '--brand-300',
  '--brand-400',
  '--brand-500',
  '--brand-600',
  '--brand-link',
  // Code blocks
  '--code-block-1',
  '--code-block-2',
  '--code-block-3',
  '--code-block-4',
  '--code-block-5',
]

/**
 * Custom style element ID for VSCode theme overrides
 */
const STYLE_ELEMENT_ID = 'supabase-vscode-theme'

/**
 * Apply theme variables to the DOM.
 * Sets CSS custom properties on :root element.
 * @param variables - Theme variables to apply
 */
export function applyThemeToDOM(variables: SupabaseThemeVariables): void {
  if (typeof document === 'undefined') return

  const root = document.querySelector(':root') as HTMLElement
  if (!root) return

  // Apply each variable
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value)
  }
}

/**
 * Remove all custom theme variables from the DOM.
 * Resets to default theme by removing inline styles.
 */
export function removeCustomTheme(): void {
  if (typeof document === 'undefined') return

  const root = document.querySelector(':root') as HTMLElement
  if (!root) return

  // Remove each managed variable
  for (const key of MANAGED_CSS_VARIABLES) {
    root.style.removeProperty(key)
  }

  // Also remove the style element if it exists
  const styleElement = document.getElementById(STYLE_ELEMENT_ID)
  if (styleElement) {
    styleElement.remove()
  }
}

/**
 * Create a style element with theme overrides.
 * Alternative to inline styles on :root.
 * @param variables - Theme variables to apply
 * @returns Style element
 */
export function createThemeStyleElement(variables: SupabaseThemeVariables): HTMLStyleElement {
  const styleElement = document.createElement('style')
  styleElement.id = STYLE_ELEMENT_ID

  const cssVars = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  styleElement.textContent = `:root {\n${cssVars}\n}`

  return styleElement
}

/**
 * Apply theme using a style element instead of inline styles.
 * This has higher specificity and is easier to manage.
 * @param variables - Theme variables to apply
 */
export function applyThemeWithStyleElement(variables: SupabaseThemeVariables): void {
  if (typeof document === 'undefined') return

  // Remove existing style element
  const existing = document.getElementById(STYLE_ELEMENT_ID)
  if (existing) {
    existing.remove()
  }

  // Create and append new style element
  const styleElement = createThemeStyleElement(variables)
  document.head.appendChild(styleElement)
}

/**
 * Check if a custom VSCode theme is currently applied.
 * @returns True if custom theme styles are applied
 */
export function isCustomThemeApplied(): boolean {
  if (typeof document === 'undefined') return false

  // Check for style element
  const styleElement = document.getElementById(STYLE_ELEMENT_ID)
  if (styleElement) return true

  // Check for inline styles on :root
  const root = document.querySelector(':root') as HTMLElement
  if (!root) return false

  // Check if any of our managed variables are set inline
  for (const key of MANAGED_CSS_VARIABLES) {
    if (root.style.getPropertyValue(key)) {
      return true
    }
  }

  return false
}

/**
 * Get all currently applied custom theme variables.
 * @returns Object with current variable values, or null if no custom theme
 */
export function getCurrentThemeVariables(): Partial<SupabaseThemeVariables> | null {
  if (typeof document === 'undefined') return null

  const root = document.querySelector(':root') as HTMLElement
  if (!root) return null

  const variables: Partial<SupabaseThemeVariables> = {}
  let hasAny = false

  for (const key of MANAGED_CSS_VARIABLES) {
    const value = root.style.getPropertyValue(key)
    if (value) {
      variables[key] = value
      hasAny = true
    }
  }

  return hasAny ? variables : null
}
