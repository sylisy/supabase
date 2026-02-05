/**
 * VSCode Themes
 *
 * A module for parsing VSCode themes and applying them to Supabase Studio.
 */

// Types
export type {
  MonacoThemeDefinition,
  SupabaseThemeVariables,
  ThemeParseResult,
  VSCodeTheme,
  VSCodeThemePreset,
  VSCodeThemeState,
  VSCodeTokenColor,
} from './types'

// Parser functions
export {
  darken,
  getLuminance,
  hexToHslString,
  isDark,
  isValidTheme,
  lighten,
  mix,
  parseVSCodeTheme,
  saturate,
  toHex,
} from './parser'

// Mapper functions
export { deriveBrandColors, getPreviewColors, mapVSCodeToSupabase } from './mapper'

// Applicator functions
export {
  applyThemeToDOM,
  applyThemeWithStyleElement,
  createThemeStyleElement,
  getCurrentThemeVariables,
  isCustomThemeApplied,
  removeCustomTheme,
} from './applicator'

// Monaco integration
export { generateMonacoTheme, generateMonacoThemeName } from './monaco'

// Presets
export { getPresetById, vscodeThemePresets } from './presets'
