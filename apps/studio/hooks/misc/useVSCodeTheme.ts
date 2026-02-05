/**
 * useVSCodeTheme Hook
 *
 * Manages VSCode theme state, including persistence to localStorage
 * and applying themes to the DOM.
 */

import { LOCAL_STORAGE_KEYS } from 'common'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  applyThemeToDOM,
  generateMonacoTheme,
  generateMonacoThemeName,
  getPresetById,
  mapVSCodeToSupabase,
  parseVSCodeTheme,
  removeCustomTheme,
  vscodeThemePresets,
  type MonacoThemeDefinition,
  type VSCodeTheme,
  type VSCodeThemePreset,
  type VSCodeThemeState,
} from 'lib/vscode-themes'

/**
 * Default theme state
 */
const DEFAULT_STATE: VSCodeThemeState = {
  isEnabled: false,
  presetId: null,
  customThemeJson: null,
}

/**
 * Load theme state from localStorage
 */
function loadStateFromStorage(): VSCodeThemeState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }

  try {
    const enabled = localStorage.getItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_ENABLED)
    const preset = localStorage.getItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_PRESET)
    const custom = localStorage.getItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_CUSTOM)

    return {
      isEnabled: enabled === 'true',
      presetId: preset || null,
      customThemeJson: custom || null,
    }
  } catch (e) {
    console.error('Failed to load VSCode theme state from localStorage:', e)
    return DEFAULT_STATE
  }
}

/**
 * Save theme state to localStorage
 */
function saveStateToStorage(state: VSCodeThemeState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_ENABLED, String(state.isEnabled))

    if (state.presetId) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_PRESET, state.presetId)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_PRESET)
    }

    if (state.customThemeJson) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_CUSTOM, state.customThemeJson)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.VSCODE_THEME_CUSTOM)
    }
  } catch (e) {
    console.error('Failed to save VSCode theme state to localStorage:', e)
  }
}

/**
 * Get the current active theme based on state
 */
function getActiveTheme(state: VSCodeThemeState): VSCodeTheme | null {
  if (!state.isEnabled) return null

  // Try preset first
  if (state.presetId) {
    const preset = getPresetById(state.presetId)
    if (preset) return preset.theme
  }

  // Try custom theme
  if (state.customThemeJson) {
    const result = parseVSCodeTheme(state.customThemeJson)
    if (result.success && result.theme) {
      return result.theme
    }
  }

  return null
}

export interface UseVSCodeThemeReturn {
  // State
  isEnabled: boolean
  currentPresetId: string | null
  customThemeJson: string | null
  currentTheme: VSCodeTheme | null
  currentPreset: VSCodeThemePreset | null
  presets: VSCodeThemePreset[]

  // Monaco theme
  monacoTheme: MonacoThemeDefinition | null
  monacoThemeName: string | null

  // Actions
  enablePreset: (presetId: string) => void
  applyCustomTheme: (json: string) => { success: boolean; error?: string }
  disable: () => void
  setEnabled: (enabled: boolean) => void
}

/**
 * Hook for managing VSCode theme state.
 *
 * Usage:
 * ```tsx
 * const { isEnabled, currentPreset, presets, enablePreset, disable } = useVSCodeTheme()
 *
 * // Enable a preset
 * enablePreset('dracula')
 *
 * // Apply custom theme
 * const result = applyCustomTheme(jsonString)
 * if (!result.success) {
 *   console.error(result.error)
 * }
 *
 * // Disable VSCode theme (revert to standard theme)
 * disable()
 * ```
 */
export function useVSCodeTheme(): UseVSCodeThemeReturn {
  // Start with default state to avoid hydration mismatch
  const [state, setState] = useState<VSCodeThemeState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)

  // Load state from localStorage after mounting (client-side only)
  useEffect(() => {
    setState(loadStateFromStorage())
    setMounted(true)
  }, [])

  // Apply theme to DOM when state changes (only after mounted)
  useEffect(() => {
    if (!mounted) return

    const theme = getActiveTheme(state)

    if (theme) {
      const variables = mapVSCodeToSupabase(theme)
      applyThemeToDOM(variables)
    } else {
      removeCustomTheme()
    }
  }, [state, mounted])

  // Save state to localStorage when it changes (only after mounted)
  useEffect(() => {
    if (!mounted) return
    saveStateToStorage(state)
  }, [state, mounted])

  // Get current active theme
  const currentTheme = useMemo(() => getActiveTheme(state), [state])

  // Get current preset
  const currentPreset = useMemo(() => {
    if (!state.presetId) return null
    return getPresetById(state.presetId) || null
  }, [state.presetId])

  // Generate Monaco theme
  const monacoTheme = useMemo(() => {
    if (!currentTheme) return null
    return generateMonacoTheme(currentTheme)
  }, [currentTheme])

  const monacoThemeName = useMemo(() => {
    if (!currentTheme) return null
    return generateMonacoThemeName(currentTheme.name)
  }, [currentTheme])

  // Enable a preset theme
  const enablePreset = useCallback((presetId: string) => {
    const preset = getPresetById(presetId)
    if (!preset) {
      console.error(`VSCode theme preset not found: ${presetId}`)
      return
    }

    setState({
      isEnabled: true,
      presetId,
      customThemeJson: null,
    })
  }, [])

  // Apply a custom theme from JSON
  const applyCustomTheme = useCallback(
    (json: string): { success: boolean; error?: string } => {
      const result = parseVSCodeTheme(json)

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setState({
        isEnabled: true,
        presetId: null,
        customThemeJson: json,
      })

      return { success: true }
    },
    []
  )

  // Disable VSCode theme
  const disable = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEnabled: false,
    }))
  }, [])

  // Set enabled state (used for toggle)
  const setEnabled = useCallback((enabled: boolean) => {
    setState((prev) => {
      // If enabling and no theme is selected, select the first preset
      if (enabled && !prev.presetId && !prev.customThemeJson) {
        return {
          isEnabled: true,
          presetId: vscodeThemePresets[0]?.id || null,
          customThemeJson: null,
        }
      }
      return {
        ...prev,
        isEnabled: enabled,
      }
    })
  }, [])

  return {
    // State
    isEnabled: state.isEnabled,
    currentPresetId: state.presetId,
    customThemeJson: state.customThemeJson,
    currentTheme,
    currentPreset,
    presets: vscodeThemePresets,

    // Monaco
    monacoTheme,
    monacoThemeName,

    // Actions
    enablePreset,
    applyCustomTheme,
    disable,
    setEnabled,
  }
}
