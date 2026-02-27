import { describe, expect, it } from 'vitest'

import {
  generateOrganizationSettingsSections,
  getOrganizationSettingsDocumentTitle,
  normalizeOrganizationSettingsPath,
} from './OrganizationSettingsLayout'

describe('OrganizationSettingsLayout helpers', () => {
  it('returns expected organization settings links', () => {
    const [section] = generateOrganizationSettingsSections({
      slug: 'my-org',
      currentPath: '/org/my-org/general',
      showSecuritySettings: true,
      showSsoSettings: true,
      showLegalDocuments: true,
    })

    expect(section.heading).toBe('Organization Settings')
    expect(section.links.map((item) => item.label)).toEqual([
      'General',
      'Security',
      'OAuth Apps',
      'SSO',
      'Audit Logs',
      'Legal Documents',
    ])
    expect(section.links.find((item) => item.label === 'General')?.isActive).toBe(true)
  })

  it('hides feature-flagged items when flags are disabled', () => {
    const [section] = generateOrganizationSettingsSections({
      slug: 'my-org',
      currentPath: '/org/my-org/general',
      showSecuritySettings: false,
      showSsoSettings: false,
      showLegalDocuments: false,
    })

    expect(section.links.map((item) => item.label)).toEqual(['General', 'OAuth Apps', 'Audit Logs'])
  })

  it('normalizes hash paths for active state checks', () => {
    const currentPath = normalizeOrganizationSettingsPath('/org/my-org/security#sso')
    const [section] = generateOrganizationSettingsSections({
      slug: 'my-org',
      currentPath,
      showSecuritySettings: true,
      showSsoSettings: true,
      showLegalDocuments: true,
    })

    expect(section.links.find((item) => item.label === 'Security')?.isActive).toBe(true)
  })

  it('uses settings as default document title when page title is not provided', () => {
    expect(getOrganizationSettingsDocumentTitle(undefined, 'Supabase')).toBe('Settings | Supabase')
  })

  it('uses page title for document title when provided', () => {
    expect(getOrganizationSettingsDocumentTitle('General', 'Supabase')).toBe('General | Supabase')
  })
})
