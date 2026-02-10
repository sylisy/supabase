import { LOCAL_STORAGE_KEYS } from 'common'

export interface FeaturePreviewFlags {
  enableSystemStatusBadge?: boolean
  // Add more flags here as needed
}

export const getFeaturePreviews = (flags: FeaturePreviewFlags = {}) => {
  const { enableSystemStatusBadge } = flags

  return [
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_UNIFIED_LOGS,
      name: 'New Logs interface',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/37234',
      isNew: true,
      isPlatformOnly: true,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_BRANCHING_2_0,
      name: 'Branching via dashboard',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/branching-2-0',
      isNew: true,
      isPlatformOnly: true,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_ADVISOR_RULES,
      name: 'Disable Advisor rules',
      discussionsUrl: undefined,
      isNew: true,
      isPlatformOnly: true,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_API_SIDE_PANEL,
      name: 'Project API documentation',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/18038',
      isNew: false,
      isPlatformOnly: false,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_CLS,
      name: 'Column-level privileges',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/20295',
      isNew: false,
      isPlatformOnly: false,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_QUEUE_OPERATIONS,
      name: 'Queue table operations',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/42460',
      isNew: true,
      isPlatformOnly: false,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_TABLE_FILTER_BAR,
      name: 'New Table Filter Bar',
      discussionsUrl: 'https://github.com/orgs/supabase/discussions/42461',
      isNew: true,
      isPlatformOnly: false,
    },
    {
      key: LOCAL_STORAGE_KEYS.UI_PREVIEW_SYSTEM_STATUS_BADGE,
      name: 'System Status Badge',
      discussionsUrl: undefined,
      isNew: true,
      isPlatformOnly: true,
      enabled: enableSystemStatusBadge ?? false,
    },
  ]
}
