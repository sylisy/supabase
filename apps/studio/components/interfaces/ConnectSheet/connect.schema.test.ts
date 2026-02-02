import { describe, test, expect } from 'vitest'
import { connectSchema, INSTALL_COMMANDS } from './connect.schema'
import { resolveSteps } from './connect.resolver'
import type { ConnectState } from './Connect.types'

// ============================================================================
// Schema Structure Tests
// ============================================================================

describe('connect.schema:structure', () => {
  test('should have all required modes', () => {
    const modeIds = connectSchema.modes.map((m) => m.id)
    expect(modeIds).toEqual(['framework'])
  })

  test('each mode should have required properties', () => {
    connectSchema.modes.forEach((mode) => {
      expect(mode.id).toBeDefined()
      expect(mode.label).toBeDefined()
      expect(mode.description).toBeDefined()
      expect(mode.fields).toBeDefined()
      expect(Array.isArray(mode.fields)).toBe(true)
    })
  })

  test('framework mode should have correct fields', () => {
    const frameworkMode = connectSchema.modes.find((m) => m.id === 'framework')
    expect(frameworkMode?.fields).toContain('framework')
    expect(frameworkMode?.fields).toContain('frameworkVariant')
    expect(frameworkMode?.fields).toContain('library')
    expect(frameworkMode?.fields).toContain('frameworkUi')
  })

  test('direct mode should be removed', () => {
    const directMode = connectSchema.modes.find((m) => m.id === 'direct')
    expect(directMode).toBeUndefined()
  })

  test('orm mode should be removed', () => {
    const ormMode = connectSchema.modes.find((m) => m.id === 'orm')
    expect(ormMode).toBeUndefined()
  })

  test('mcp mode should be removed', () => {
    const mcpMode = connectSchema.modes.find((m) => m.id === 'mcp')
    expect(mcpMode).toBeUndefined()
  })

  test('all mode fields should exist in fields definition', () => {
    connectSchema.modes.forEach((mode) => {
      mode.fields.forEach((fieldId) => {
        expect(
          connectSchema.fields[fieldId],
          `Field "${fieldId}" in mode "${mode.id}" should exist in fields definition`
        ).toBeDefined()
      })
    })
  })
})

// ============================================================================
// Field Definition Tests
// ============================================================================

describe('connect.schema:fields', () => {
  test('framework field should have correct type', () => {
    const field = connectSchema.fields.framework
    expect(field.type).toBe('radio-grid')
    expect(field.options).toEqual({ source: 'frameworks' })
    expect(field.defaultValue).toBe('nextjs')
  })

  test('frameworkVariant field should depend on framework', () => {
    const field = connectSchema.fields.frameworkVariant
    expect(field.dependsOn).toEqual({ framework: ['nextjs', 'react'] })
  })

  test('frameworkUi field should be a switch type', () => {
    const field = connectSchema.fields.frameworkUi
    expect(field.type).toBe('switch')
    expect(field.defaultValue).toBe(false)
    expect(field.dependsOn).toEqual({ framework: ['nextjs', 'react'] })
  })

  test('connectionMethod field should be removed', () => {
    const field = connectSchema.fields.connectionMethod
    expect(field).toBeUndefined()
  })

  test('useSharedPooler field should be removed', () => {
    const field = connectSchema.fields.useSharedPooler
    expect(field).toBeUndefined()
  })

  test('orm field should be removed', () => {
    const field = connectSchema.fields.orm
    expect(field).toBeUndefined()
  })

  test('mcpClient field should be removed', () => {
    const field = connectSchema.fields.mcpClient
    expect(field).toBeUndefined()
  })

  test('mcpFeatures field should be removed', () => {
    const field = connectSchema.fields.mcpFeatures
    expect(field).toBeUndefined()
  })
})

// ============================================================================
// Install Commands Tests
// ============================================================================

describe('connect.schema:INSTALL_COMMANDS', () => {
  test('should have install command for supabase-js', () => {
    expect(INSTALL_COMMANDS.supabasejs).toBe('npm install @supabase/supabase-js')
  })

  test('should have install command for supabase-py', () => {
    expect(INSTALL_COMMANDS.supabasepy).toBe('pip install supabase')
  })

  test('should have install command for supabase-flutter', () => {
    expect(INSTALL_COMMANDS.supabaseflutter).toBe('flutter pub add supabase_flutter')
  })

  test('should have install command for supabase-swift', () => {
    expect(INSTALL_COMMANDS.supabaseswift).toContain('swift package add-dependency')
  })

  test('should have install command for supabase-kt', () => {
    expect(INSTALL_COMMANDS.supabasekt).toContain('io.github.jan-tennert.supabase')
  })
})

// ============================================================================
// Steps Resolution Integration Tests
// ============================================================================

describe('connect.schema:steps resolution', () => {
  describe('framework mode steps', () => {
    test('should resolve steps for nextjs without shadcn', () => {
      const state: ConnectState = { mode: 'framework', framework: 'nextjs', frameworkUi: false }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBeGreaterThan(0)
      expect(steps.find((s) => s.id === 'install')).toBeDefined()
      expect(steps.find((s) => s.id === 'install-skills')).toBeDefined()
    })

    test('should resolve shadcn steps for nextjs with frameworkUi true', () => {
      const state: ConnectState = { mode: 'framework', framework: 'nextjs', frameworkUi: true }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.find((s) => s.id === 'shadcn-add')).toBeDefined()
      expect(steps.find((s) => s.id === 'shadcn-explore')).toBeDefined()
    })

    test('should resolve steps for react without shadcn', () => {
      const state: ConnectState = { mode: 'framework', framework: 'react', frameworkUi: false }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBeGreaterThan(0)
      expect(steps.find((s) => s.id === 'install')).toBeDefined()
    })

    test('should resolve shadcn steps for react with frameworkUi true', () => {
      const state: ConnectState = { mode: 'framework', framework: 'react', frameworkUi: true }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.find((s) => s.id === 'shadcn-add')).toBeDefined()
    })

    test('should resolve default steps for other frameworks', () => {
      const state: ConnectState = { mode: 'framework', framework: 'remix' }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBeGreaterThan(0)
      expect(steps.find((s) => s.id === 'install')).toBeDefined()
      expect(steps.find((s) => s.id === 'configure')).toBeDefined()
    })
  })

  describe('direct mode steps', () => {
    test('should not resolve steps for direct mode', () => {
      const state: ConnectState = { mode: 'direct' }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBe(0)
    })
  })

  describe('orm mode steps', () => {
    test('should not resolve steps for orm mode', () => {
      const state: ConnectState = { mode: 'orm', orm: 'prisma' }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBe(0)
    })
  })

  describe('mcp mode steps', () => {
    test('should not resolve steps for mcp mode', () => {
      const state: ConnectState = { mode: 'mcp', mcpClient: 'cursor' }
      const steps = resolveSteps(connectSchema, state)

      expect(steps.length).toBe(0)
    })
  })

  describe('skills install step', () => {
    test('should include skills install step in all modes', () => {
      const modes: ConnectState['mode'][] = ['framework']

      modes.forEach((mode) => {
        const state: ConnectState = { mode }
        const steps = resolveSteps(connectSchema, state)

        expect(
          steps.find((s) => s.id === 'install-skills'),
          `Mode "${mode}" should have skills install step`
        ).toBeDefined()
      })
    })
  })
})

// ============================================================================
// Step Content Path Tests
// ============================================================================

describe('connect.schema:step content paths', () => {
  test('install step should have valid content path', () => {
    const state: ConnectState = { mode: 'framework', framework: 'nextjs' }
    const steps = resolveSteps(connectSchema, state)
    const installStep = steps.find((s) => s.id === 'install')

    expect(installStep?.content).toBe('steps/install')
  })

  test('shadcn command step should have valid content path', () => {
    const state: ConnectState = { mode: 'framework', framework: 'nextjs', frameworkUi: true }
    const steps = resolveSteps(connectSchema, state)
    const shadcnStep = steps.find((s) => s.id === 'shadcn-add')

    expect(shadcnStep?.content).toBe('steps/shadcn/command')
  })

  test('shadcn explore step should have valid content path', () => {
    const state: ConnectState = { mode: 'framework', framework: 'nextjs', frameworkUi: true }
    const steps = resolveSteps(connectSchema, state)
    const exploreStep = steps.find((s) => s.id === 'shadcn-explore')

    expect(exploreStep?.content).toBe('steps/shadcn/explore')
  })

  test('direct connection step should not be resolved', () => {
    const state: ConnectState = { mode: 'direct' }
    const steps = resolveSteps(connectSchema, state)

    expect(steps.length).toBe(0)
  })

  test('skills install step should have valid content path', () => {
    const state: ConnectState = { mode: 'framework' }
    const steps = resolveSteps(connectSchema, state)
    const skillsStep = steps.find((s) => s.id === 'install-skills')

    expect(skillsStep?.content).toBe('steps/skills-install')
  })

  test('orm configure step should not be resolved', () => {
    const state: ConnectState = { mode: 'orm', orm: 'prisma' }
    const steps = resolveSteps(connectSchema, state)

    expect(steps.length).toBe(0)
  })

  test('mcp cursor configure step should not be resolved', () => {
    const state: ConnectState = { mode: 'mcp', mcpClient: 'cursor' }
    const steps = resolveSteps(connectSchema, state)

    expect(steps.length).toBe(0)
  })

  test('codex steps should not be resolved', () => {
    const state: ConnectState = { mode: 'mcp', mcpClient: 'codex' }
    const steps = resolveSteps(connectSchema, state)

    expect(steps.length).toBe(0)
  })

  test('claude-code steps should not be resolved', () => {
    const state: ConnectState = { mode: 'mcp', mcpClient: 'claude-code' }
    const steps = resolveSteps(connectSchema, state)

    expect(steps.length).toBe(0)
  })
})
