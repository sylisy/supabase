/**
 * VSCode Theme Parser
 *
 * Functions to parse and validate VSCode theme JSON.
 */

import { TinyColor } from '@ctrl/tinycolor'
import type { ThemeParseResult, VSCodeTheme } from './types'

/**
 * Convert hex color to HSL string format used by Supabase CSS variables.
 * @param hex - Hex color string (e.g., "#1e1e1e")
 * @returns HSL string in format "Hdeg S% L%" (e.g., "0deg 0% 11.8%")
 */
export function hexToHslString(hex: string): string {
  const color = new TinyColor(hex)
  const hsl = color.toHsl()

  // Format: "Hdeg S% L%"
  const h = Math.round(hsl.h * 10) / 10
  const s = Math.round(hsl.s * 1000) / 10
  const l = Math.round(hsl.l * 1000) / 10

  return `${h}deg ${s}% ${l}%`
}

/**
 * Convert any color format to hex.
 * @param color - Color in any format
 * @returns Hex color string or null if invalid
 */
export function toHex(color: string): string | null {
  const tinyColor = new TinyColor(color)
  if (!tinyColor.isValid) return null
  return tinyColor.toHexString()
}

/**
 * Lighten a color by a percentage.
 * @param hex - Hex color string
 * @param amount - Amount to lighten (0-100)
 * @returns Lightened hex color
 */
export function lighten(hex: string, amount: number): string {
  return new TinyColor(hex).lighten(amount).toHexString()
}

/**
 * Darken a color by a percentage.
 * @param hex - Hex color string
 * @param amount - Amount to darken (0-100)
 * @returns Darkened hex color
 */
export function darken(hex: string, amount: number): string {
  return new TinyColor(hex).darken(amount).toHexString()
}

/**
 * Adjust saturation of a color.
 * @param hex - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export function saturate(hex: string, amount: number): string {
  if (amount >= 0) {
    return new TinyColor(hex).saturate(amount).toHexString()
  }
  return new TinyColor(hex).desaturate(Math.abs(amount)).toHexString()
}

/**
 * Mix two colors together.
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param amount - Mix ratio (0-100, where 0 is all color1, 100 is all color2)
 * @returns Mixed hex color
 */
export function mix(color1: string, color2: string, amount: number): string {
  return new TinyColor(color1).mix(color2, amount).toHexString()
}

/**
 * Get the luminance of a color (0-1).
 * @param hex - Hex color string
 * @returns Luminance value
 */
export function getLuminance(hex: string): number {
  return new TinyColor(hex).getLuminance()
}

/**
 * Check if a color is dark.
 * @param hex - Hex color string
 * @returns True if the color is dark
 */
export function isDark(hex: string): boolean {
  return new TinyColor(hex).isDark()
}

/**
 * Strip comments from JSON string (JSONC format).
 * Handles both single-line (//) and multi-line comments.
 * @param jsonc - JSON string potentially containing comments
 * @returns Clean JSON string without comments
 */
function stripJsonComments(jsonc: string): string {
  let result = ''
  let i = 0
  let inString = false
  let stringChar = ''

  while (i < jsonc.length) {
    const char = jsonc[i]
    const nextChar = jsonc[i + 1]

    // Track if we're inside a string
    if ((char === '"' || char === "'") && (i === 0 || jsonc[i - 1] !== '\\')) {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
    }

    // If we're in a string, just add the character
    if (inString) {
      result += char
      i++
      continue
    }

    // Check for single-line comment
    if (char === '/' && nextChar === '/') {
      // Skip until end of line
      while (i < jsonc.length && jsonc[i] !== '\n') {
        i++
      }
      continue
    }

    // Check for multi-line comment
    if (char === '/' && nextChar === '*') {
      i += 2 // Skip /*
      // Skip until */
      while (i < jsonc.length - 1 && !(jsonc[i] === '*' && jsonc[i + 1] === '/')) {
        i++
      }
      i += 2 // Skip */
      continue
    }

    result += char
    i++
  }

  return result
}

/**
 * Parse VSCode theme JSON and validate its structure.
 * Supports JSONC format (JSON with comments).
 * @param json - JSON string of VSCode theme (may contain comments)
 * @returns Parse result with theme or error
 */
export function parseVSCodeTheme(json: string): ThemeParseResult {
  try {
    // Strip comments before parsing
    const cleanJson = stripJsonComments(json)
    const parsed = JSON.parse(cleanJson)

    // Validate required fields
    if (!parsed.name || typeof parsed.name !== 'string') {
      return {
        success: false,
        error: 'Theme must have a "name" field (string)',
      }
    }

    if (!parsed.colors || typeof parsed.colors !== 'object') {
      return {
        success: false,
        error: 'Theme must have a "colors" object',
      }
    }

    // Validate that at least some essential colors are present
    const essentialColors = ['editor.background', 'editor.foreground']
    const hasEssentialColors = essentialColors.some((color) => parsed.colors[color])

    if (!hasEssentialColors) {
      return {
        success: false,
        error: 'Theme must have at least "editor.background" or "editor.foreground" color',
      }
    }

    // Validate color format (should be hex)
    for (const [key, value] of Object.entries(parsed.colors)) {
      if (value && typeof value === 'string') {
        const color = new TinyColor(value)
        if (!color.isValid) {
          return {
            success: false,
            error: `Invalid color value for "${key}": ${value}`,
          }
        }
      }
    }

    // Validate tokenColors if present
    if (parsed.tokenColors) {
      if (!Array.isArray(parsed.tokenColors)) {
        return {
          success: false,
          error: '"tokenColors" must be an array',
        }
      }

      for (let i = 0; i < parsed.tokenColors.length; i++) {
        const token = parsed.tokenColors[i]
        if (!token.scope) {
          return {
            success: false,
            error: `tokenColors[${i}] must have a "scope" field`,
          }
        }
        // Settings is optional - some tokens only define scope without settings
      }
    }

    // Infer theme type from background color if not specified
    let themeType: 'dark' | 'light' = parsed.type
    if (!themeType || !['dark', 'light'].includes(themeType)) {
      const bgColor = parsed.colors['editor.background']
      if (bgColor) {
        // Use isDark to determine if it's a dark or light theme
        themeType = isDark(bgColor) ? 'dark' : 'light'
      } else {
        // Default to dark if we can't determine
        themeType = 'dark'
      }
    }

    const theme: VSCodeTheme = {
      name: parsed.name,
      type: themeType,
      colors: parsed.colors,
      tokenColors: parsed.tokenColors,
    }

    return {
      success: true,
      theme,
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof SyntaxError ? `Invalid JSON: ${e.message}` : 'Failed to parse theme',
    }
  }
}

/**
 * Validate that a theme object is well-formed.
 * @param theme - VSCode theme object
 * @returns True if valid
 */
export function isValidTheme(theme: unknown): theme is VSCodeTheme {
  if (!theme || typeof theme !== 'object') return false
  const t = theme as Record<string, unknown>
  return (
    typeof t.name === 'string' &&
    (t.type === 'dark' || t.type === 'light') &&
    typeof t.colors === 'object' &&
    t.colors !== null
  )
}
