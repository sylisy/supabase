/**
 * VSCode Theme Mapper
 *
 * Maps VSCode theme colors to Supabase CSS variables.
 */

import { darken, hexToHslString, lighten, mix, saturate } from './parser'
import type { SupabaseThemeVariables, VSCodeTheme } from './types'

/**
 * Default brand color (Supabase green)
 */
const DEFAULT_BRAND_COLOR = '#3ECF8E'

/**
 * Derive a full brand color scale from a single accent color.
 * @param accentColor - Hex accent color
 * @param isDarkTheme - Whether the theme is dark
 * @returns Object with brand color scale
 */
export function deriveBrandColors(
  accentColor: string,
  isDarkTheme: boolean
): {
  '--brand-default': string
  '--brand-accent': string
  '--brand-200': string
  '--brand-300': string
  '--brand-400': string
  '--brand-500': string
  '--brand-600': string
  '--brand-link': string
} {
  // For dark themes, we create lighter variants going up
  // For light themes, we create darker variants going up
  if (isDarkTheme) {
    return {
      '--brand-default': hexToHslString(accentColor),
      '--brand-accent': hexToHslString(lighten(accentColor, 15)),
      '--brand-200': hexToHslString(darken(saturate(accentColor, -40), 35)),
      '--brand-300': hexToHslString(darken(saturate(accentColor, -30), 30)),
      '--brand-400': hexToHslString(darken(saturate(accentColor, -20), 25)),
      '--brand-500': hexToHslString(darken(saturate(accentColor, -10), 15)),
      '--brand-600': hexToHslString(lighten(saturate(accentColor, 10), 20)),
      '--brand-link': hexToHslString(accentColor),
    }
  } else {
    return {
      '--brand-default': hexToHslString(accentColor),
      '--brand-accent': hexToHslString(darken(accentColor, 10)),
      '--brand-200': hexToHslString(lighten(saturate(accentColor, -40), 45)),
      '--brand-300': hexToHslString(lighten(saturate(accentColor, -30), 40)),
      '--brand-400': hexToHslString(lighten(saturate(accentColor, -20), 35)),
      '--brand-500': hexToHslString(lighten(saturate(accentColor, -10), 25)),
      '--brand-600': hexToHslString(darken(saturate(accentColor, 10), 10)),
      '--brand-link': hexToHslString(darken(accentColor, 5)),
    }
  }
}

/**
 * Get accent color from VSCode theme.
 * Tries multiple potential accent color sources.
 * @param theme - VSCode theme
 * @returns Accent color hex or default brand color
 */
function getAccentColor(theme: VSCodeTheme): string {
  const colors = theme.colors

  // Try to find an accent color from various sources
  return (
    colors['activityBarBadge.background'] ||
    colors['button.background'] ||
    colors['badge.background'] ||
    colors['textLink.foreground'] ||
    colors['panelTitle.activeBorder'] ||
    colors.focusBorder ||
    DEFAULT_BRAND_COLOR
  )
}

/**
 * Derive background color variants from a base background.
 * @param baseBackground - Base background hex color
 * @param isDarkTheme - Whether the theme is dark
 * @returns Object with background variants
 */
function deriveBackgroundVariants(baseBackground: string, isDarkTheme: boolean) {
  if (isDarkTheme) {
    return {
      '--background-default': hexToHslString(baseBackground),
      '--background-alternative': hexToHslString(darken(baseBackground, 2)),
      '--background-selection': hexToHslString(lighten(baseBackground, 6)),
      '--background-control': hexToHslString(lighten(baseBackground, 7)),
      '--background-surface-100': hexToHslString(lighten(baseBackground, 2)),
      '--background-surface-200': hexToHslString(lighten(baseBackground, 3)),
      '--background-surface-300': hexToHslString(lighten(baseBackground, 6)),
      '--background-overlay-default': hexToHslString(lighten(baseBackground, 3)),
      '--background-overlay-hover': hexToHslString(lighten(baseBackground, 7)),
      '--background-muted': hexToHslString(lighten(baseBackground, 7)),
    }
  } else {
    return {
      '--background-default': hexToHslString(baseBackground),
      '--background-alternative': hexToHslString(darken(baseBackground, 2)),
      '--background-selection': hexToHslString(darken(baseBackground, 5)),
      '--background-control': hexToHslString(darken(baseBackground, 3)),
      '--background-surface-100': hexToHslString(darken(baseBackground, 2)),
      '--background-surface-200': hexToHslString(darken(baseBackground, 4)),
      '--background-surface-300': hexToHslString(darken(baseBackground, 6)),
      '--background-overlay-default': hexToHslString(darken(baseBackground, 3)),
      '--background-overlay-hover': hexToHslString(darken(baseBackground, 6)),
      '--background-muted': hexToHslString(darken(baseBackground, 5)),
    }
  }
}

/**
 * Derive foreground color variants from a base foreground.
 * @param baseForeground - Base foreground hex color
 * @param isDarkTheme - Whether the theme is dark
 * @returns Object with foreground variants
 */
function deriveForegroundVariants(baseForeground: string, isDarkTheme: boolean) {
  if (isDarkTheme) {
    return {
      '--foreground-default': hexToHslString(baseForeground),
      '--foreground-light': hexToHslString(darken(baseForeground, 25)),
      '--foreground-lighter': hexToHslString(darken(baseForeground, 40)),
      '--foreground-muted': hexToHslString(darken(baseForeground, 60)),
    }
  } else {
    return {
      '--foreground-default': hexToHslString(baseForeground),
      '--foreground-light': hexToHslString(lighten(baseForeground, 20)),
      '--foreground-lighter': hexToHslString(lighten(baseForeground, 35)),
      '--foreground-muted': hexToHslString(lighten(baseForeground, 55)),
    }
  }
}

/**
 * Derive border color variants from base colors.
 * @param baseBackground - Base background hex color
 * @param baseForeground - Base foreground hex color
 * @param isDarkTheme - Whether the theme is dark
 * @returns Object with border variants
 */
function deriveBorderVariants(
  baseBackground: string,
  baseForeground: string,
  isDarkTheme: boolean
) {
  // Create border colors by mixing background and foreground
  const borderBase = mix(baseBackground, baseForeground, isDarkTheme ? 15 : 20)

  if (isDarkTheme) {
    return {
      '--border-default': hexToHslString(lighten(baseBackground, 7)),
      '--border-muted': hexToHslString(lighten(baseBackground, 5)),
      '--border-secondary': hexToHslString(lighten(baseBackground, 6)),
      '--border-overlay': hexToHslString(lighten(baseBackground, 5)),
      '--border-control': hexToHslString(lighten(baseBackground, 10)),
      '--border-alternative': hexToHslString(lighten(baseBackground, 9)),
      '--border-strong': hexToHslString(borderBase),
      '--border-stronger': hexToHslString(lighten(borderBase, 5)),
    }
  } else {
    return {
      '--border-default': hexToHslString(darken(baseBackground, 10)),
      '--border-muted': hexToHslString(darken(baseBackground, 8)),
      '--border-secondary': hexToHslString(darken(baseBackground, 9)),
      '--border-overlay': hexToHslString(darken(baseBackground, 8)),
      '--border-control': hexToHslString(darken(baseBackground, 12)),
      '--border-alternative': hexToHslString(darken(baseBackground, 11)),
      '--border-strong': hexToHslString(borderBase),
      '--border-stronger': hexToHslString(darken(borderBase, 5)),
    }
  }
}

/**
 * Extract code block colors from VSCode tokenColors.
 * @param theme - VSCode theme
 * @returns Object with code block colors
 */
function deriveCodeBlockColors(theme: VSCodeTheme): {
  '--code-block-1': string
  '--code-block-2': string
  '--code-block-3': string
  '--code-block-4': string
  '--code-block-5': string
} {
  const tokenColors = theme.tokenColors || []

  // Default colors for each code block category
  const defaults = {
    '--code-block-1': '#4EC9B0', // Functions, classes (teal)
    '--code-block-2': '#DCDCAA', // Strings (yellow)
    '--code-block-3': '#B5CEA8', // Numbers, constants (green)
    '--code-block-4': '#C586C0', // Keywords (purple)
    '--code-block-5': '#CE9178', // Variables, parameters (orange)
  }

  // Scope mappings for each code block category
  const scopeMappings = {
    '--code-block-1': [
      'entity.name.function',
      'entity.name.class',
      'support.function',
      'entity.name.type',
    ],
    '--code-block-2': ['string', 'string.quoted', 'string.template'],
    '--code-block-3': ['constant.numeric', 'constant', 'constant.language'],
    '--code-block-4': ['keyword', 'storage', 'keyword.control', 'storage.type'],
    '--code-block-5': ['variable', 'variable.parameter', 'variable.other', 'entity.name.variable'],
  }

  const result: Record<string, string> = { ...defaults }

  // Find matching token colors
  for (const [varName, scopes] of Object.entries(scopeMappings)) {
    for (const token of tokenColors) {
      const tokenScopes = Array.isArray(token.scope) ? token.scope : [token.scope]
      const hasMatch = scopes.some((scope) =>
        tokenScopes.some((ts) => ts.startsWith(scope) || ts === scope)
      )

      if (hasMatch && token.settings?.foreground) {
        result[varName] = token.settings.foreground
        break
      }
    }
  }

  return {
    '--code-block-1': hexToHslString(result['--code-block-1']),
    '--code-block-2': hexToHslString(result['--code-block-2']),
    '--code-block-3': hexToHslString(result['--code-block-3']),
    '--code-block-4': hexToHslString(result['--code-block-4']),
    '--code-block-5': hexToHslString(result['--code-block-5']),
  }
}

/**
 * Map VSCode theme to Supabase CSS variables.
 * @param theme - Parsed VSCode theme
 * @returns Supabase theme variables in HSL format
 */
export function mapVSCodeToSupabase(theme: VSCodeTheme): SupabaseThemeVariables {
  const isDarkTheme = theme.type === 'dark'
  const colors = theme.colors

  // Get base colors with fallbacks
  const baseBackground =
    colors['editor.background'] || (isDarkTheme ? '#1e1e1e' : '#ffffff')
  const baseForeground = colors['editor.foreground'] || (isDarkTheme ? '#d4d4d4' : '#333333')

  // Use sidebar background if available, otherwise derive from editor background
  const sidebarBackground = colors['sideBar.background'] || baseBackground

  // Get accent color for brand colors
  const accentColor = getAccentColor(theme)

  // Derive all color variants
  const backgroundVars = deriveBackgroundVariants(baseBackground, isDarkTheme)
  const foregroundVars = deriveForegroundVariants(baseForeground, isDarkTheme)
  const borderVars = deriveBorderVariants(baseBackground, baseForeground, isDarkTheme)
  const brandVars = deriveBrandColors(accentColor, isDarkTheme)
  const codeBlockVars = deriveCodeBlockColors(theme)

  // Override surface colors with actual VSCode colors if available
  if (colors['sideBar.background']) {
    backgroundVars['--background-surface-100'] = hexToHslString(sidebarBackground)
  }
  if (colors['sideBarSectionHeader.background']) {
    backgroundVars['--background-surface-200'] = hexToHslString(
      colors['sideBarSectionHeader.background']
    )
  }
  if (colors['panel.background']) {
    backgroundVars['--background-surface-300'] = hexToHslString(colors['panel.background'])
  }

  // Override border if panel.border is available
  if (colors['panel.border']) {
    borderVars['--border-default'] = hexToHslString(colors['panel.border'])
  }

  return {
    ...backgroundVars,
    ...foregroundVars,
    ...borderVars,
    ...brandVars,
    ...codeBlockVars,
  } as SupabaseThemeVariables
}

/**
 * Get a minimal set of preview colors from a theme.
 * @param theme - VSCode theme
 * @returns Preview colors object
 */
export function getPreviewColors(theme: VSCodeTheme): {
  background: string
  foreground: string
  accent: string
  surface: string
} {
  const colors = theme.colors
  const isDarkTheme = theme.type === 'dark'

  return {
    background: colors['editor.background'] || (isDarkTheme ? '#1e1e1e' : '#ffffff'),
    foreground: colors['editor.foreground'] || (isDarkTheme ? '#d4d4d4' : '#333333'),
    accent: getAccentColor(theme),
    surface: colors['sideBar.background'] || colors['editor.background'] || (isDarkTheme ? '#252526' : '#f3f3f3'),
  }
}
