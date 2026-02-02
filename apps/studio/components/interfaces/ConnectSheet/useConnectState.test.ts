import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConnectState } from './useConnectState'

describe('useConnectState', () => {
  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('initial state', () => {
    test('should initialize with framework mode by default', () => {
      const { result } = renderHook(() => useConnectState())
      expect(result.current.state.mode).toBe('framework')
    })

    test('should initialize with nextjs as default framework', () => {
      const { result } = renderHook(() => useConnectState())
      expect(result.current.state.framework).toBe('nextjs')
    })

    test('should initialize with app variant for nextjs', () => {
      const { result } = renderHook(() => useConnectState())
      expect(result.current.state.frameworkVariant).toBe('app')
    })

    test('should initialize with supabasejs library', () => {
      const { result } = renderHook(() => useConnectState())
      expect(result.current.state.library).toBe('supabasejs')
    })

    test('should accept initial state override', () => {
      const { result } = renderHook(() =>
        useConnectState({ framework: 'react', frameworkVariant: 'vite' })
      )
      expect(result.current.state.mode).toBe('framework')
      expect(result.current.state.framework).toBe('react')
      expect(result.current.state.frameworkVariant).toBe('vite')
    })

    test('should merge initial state with defaults', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'react' }))
      expect(result.current.state.mode).toBe('framework')
      expect(result.current.state.framework).toBe('react')
    })
  })

  // ============================================================================
  // Mode Switching Tests
  // ============================================================================

  describe('setMode', () => {
    test('should preserve framework state when setting framework mode', () => {
      const { result } = renderHook(() => useConnectState())

      // Change framework
      act(() => {
        result.current.updateField('framework', 'react')
      })

      // Set framework mode again
      act(() => {
        result.current.setMode('framework')
      })

      expect(result.current.state.framework).toBe('react')
    })
  })

  // ============================================================================
  // Field Update Tests
  // ============================================================================

  describe('updateField', () => {
    test('should update framework selection', () => {
      const { result } = renderHook(() => useConnectState())

      act(() => {
        result.current.updateField('framework', 'react')
      })

      expect(result.current.state.framework).toBe('react')
    })

    test('should cascade variant reset when changing framework', () => {
      const { result } = renderHook(() => useConnectState())

      // Start with nextjs which has variants
      expect(result.current.state.frameworkVariant).toBe('app')

      // Switch to a framework with multiple variants
      act(() => {
        result.current.updateField('framework', 'react')
      })

      // Should have the first variant of react
      expect(result.current.state.frameworkVariant).toBeDefined()
    })

    test('should remove variant when switching to framework without variants', () => {
      const { result } = renderHook(() => useConnectState())

      // Start with nextjs which has variants
      expect(result.current.state.frameworkVariant).toBe('app')

      // Switch to remix which has no variants
      act(() => {
        result.current.updateField('framework', 'remix')
      })

      expect(result.current.state.frameworkVariant).toBeUndefined()
    })

    test('should update library when variant changes', () => {
      const { result } = renderHook(() => useConnectState())

      act(() => {
        result.current.updateField('frameworkVariant', 'pages')
      })

      expect(result.current.state.library).toBe('supabasejs')
    })

    test('should update boolean fields', () => {
      const { result } = renderHook(() => useConnectState())

      act(() => {
        result.current.updateField('frameworkUi', true)
      })

      expect(result.current.state.frameworkUi).toBe(true)
    })
  })

  // ============================================================================
  // Active Fields Tests
  // ============================================================================

  describe('activeFields', () => {
    test('should return framework mode fields', () => {
      const { result } = renderHook(() => useConnectState())

      const fieldIds = result.current.activeFields.map((f) => f.id)
      expect(fieldIds).toContain('framework')
    })

    test('should include variant field for nextjs', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'nextjs' }))

      const fieldIds = result.current.activeFields.map((f) => f.id)
      expect(fieldIds).toContain('frameworkVariant')
    })

    test('should include frameworkUi field for nextjs', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'nextjs' }))

      const fieldIds = result.current.activeFields.map((f) => f.id)
      expect(fieldIds).toContain('frameworkUi')
    })

    test('should not include frameworkUi for non-nextjs/react frameworks', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'remix' }))

      const fieldIds = result.current.activeFields.map((f) => f.id)
      expect(fieldIds).not.toContain('frameworkUi')
    })
  })

  // ============================================================================
  // Resolved Steps Tests
  // ============================================================================

  describe('resolvedSteps', () => {
    test('should resolve steps for framework mode', () => {
      const { result } = renderHook(() => useConnectState())

      expect(result.current.resolvedSteps.length).toBeGreaterThan(0)
    })

    test('should have install step for framework mode', () => {
      const { result } = renderHook(() => useConnectState())

      const stepIds = result.current.resolvedSteps.map((s) => s.id)
      expect(stepIds).toContain('install')
    })

    test('should include skills install step', () => {
      const { result } = renderHook(() => useConnectState())

      const stepIds = result.current.resolvedSteps.map((s) => s.id)
      expect(stepIds).toContain('install-skills')
    })

    test('should resolve shadcn steps when frameworkUi is true', () => {
      const { result } = renderHook(() =>
        useConnectState({ framework: 'nextjs', frameworkUi: true })
      )

      const stepIds = result.current.resolvedSteps.map((s) => s.id)
      expect(stepIds).toContain('shadcn-add')
    })
  })

  // ============================================================================
  // Field Options Tests
  // ============================================================================

  describe('getFieldOptions', () => {
    test('should return framework options', () => {
      const { result } = renderHook(() => useConnectState())

      const options = result.current.getFieldOptions('framework')
      expect(options.length).toBeGreaterThan(0)
      expect(options.some((o) => o.value === 'nextjs')).toBe(true)
      expect(options.some((o) => o.value === 'react')).toBe(true)
    })

    test('should return variant options for nextjs', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'nextjs' }))

      const options = result.current.getFieldOptions('frameworkVariant')
      expect(options.length).toBeGreaterThan(0)
      expect(options.some((o) => o.value === 'app')).toBe(true)
      expect(options.some((o) => o.value === 'pages')).toBe(true)
    })

    test('should return empty variant options for frameworks without variants', () => {
      const { result } = renderHook(() => useConnectState({ framework: 'remix' }))

      const options = result.current.getFieldOptions('frameworkVariant')
      expect(options).toEqual([])
    })

    test('should return empty array for unknown field', () => {
      const { result } = renderHook(() => useConnectState())

      const options = result.current.getFieldOptions('unknownField')
      expect(options).toEqual([])
    })

    test('should return library options for selected framework', () => {
      const { result } = renderHook(() =>
        useConnectState({ framework: 'nextjs', frameworkVariant: 'app' })
      )

      const options = result.current.getFieldOptions('library')
      expect(options.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Schema Access Tests
  // ============================================================================

  describe('schema', () => {
    test('should expose the connect schema', () => {
      const { result } = renderHook(() => useConnectState())

      expect(result.current.schema).toBeDefined()
      expect(result.current.schema.modes).toBeDefined()
      expect(result.current.schema.fields).toBeDefined()
      expect(result.current.schema.steps).toBeDefined()
    })

    test('should have all expected modes in schema', () => {
      const { result } = renderHook(() => useConnectState())

      const modeIds = result.current.schema.modes.map((m) => m.id)
      expect(modeIds).toEqual(['framework'])
    })
  })
})
