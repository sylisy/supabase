import Link from 'next/link'
import { Settings } from 'lucide-react'

import { useFlag, useParams } from 'common'
import {
  useIsAPIDocsSidePanelEnabled,
  useIsColumnLevelPrivilegesEnabled,
  useUnifiedLogsPreview,
} from 'components/interfaces/App/FeaturePreview/FeaturePreviewContext'
import { useIsETLPrivateAlpha } from 'components/interfaces/Database/Replication/useIsETLPrivateAlpha'
import { useDatabaseExtensionsQuery } from 'data/database-extensions/database-extensions-query'
import { useProjectAddonsQuery } from 'data/subscriptions/project-addons-query'
import { useIsFeatureEnabled } from 'hooks/misc/useIsFeatureEnabled'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { Home } from 'icons'
import { IS_PLATFORM } from 'lib/constants'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from 'ui'

import { NavGroup } from './NavGroup'
import { NavUser } from './NavUser'
import { OrgSelector } from './OrgSelector'
import { ProjectBranchSelector } from './ProjectBranchSelector'
import {
  generateDatabaseNavItems,
  generateIntegrationsNavItems,
  generateObservabilityNavItems,
  generatePlatformNavItems,
} from './NavigationV2.utils'

export function AppSidebarV2() {
  const { ref: projectRef } = useParams()
  const { data: project } = useSelectedProjectQuery()

  // Database flags
  const { data: extensions } = useDatabaseExtensionsQuery({
    projectRef: project?.ref,
    connectionString: project?.connectionString,
  })
  const { data: addons } = useProjectAddonsQuery({ projectRef: project?.ref })

  const pgNetExtensionExists =
    (extensions ?? []).find((ext) => ext.name === 'pg_net') !== undefined
  const pitrEnabled =
    addons?.selected_addons.find((addon) => addon.type === 'pitr') !== undefined
  const columnLevelPrivileges = useIsColumnLevelPrivilegesEnabled()
  const enablePgReplicate = useIsETLPrivateAlpha()

  const {
    databaseReplication: showPgReplicate,
    databaseRoles: showRoles,
    integrationsWrappers: showWrappers,
  } = useIsFeatureEnabled(['database:replication', 'database:roles', 'integrations:wrappers'])

  // Platform flags
  const {
    projectAuthAll: authEnabled,
    projectEdgeFunctionAll: edgeFunctionsEnabled,
    projectStorageAll: storageEnabled,
    realtimeAll: realtimeEnabled,
  } = useIsFeatureEnabled([
    'project_auth:all',
    'project_edge_function:all',
    'project_storage:all',
    'realtime:all',
  ])
  const authOverviewPageEnabled = useFlag('authOverviewPage')

  // Other flags
  const showReports = useIsFeatureEnabled('reports:all')
  const isNewAPIDocsEnabled = useIsAPIDocsSidePanelEnabled()
  const { isEnabled: isUnifiedLogsEnabled } = useUnifiedLogsPreview()

  const ref = projectRef ?? 'default'

  const databaseItems = generateDatabaseNavItems(ref, project, {
    pgNetExtensionExists,
    pitrEnabled,
    columnLevelPrivileges,
    showPgReplicate,
    enablePgReplicate,
    showRoles,
    showWrappers,
  })

  const platformItems = generatePlatformNavItems(ref, project, {
    authEnabled,
    edgeFunctionsEnabled,
    storageEnabled,
    realtimeEnabled,
    authOverviewPageEnabled,
  })

  const observabilityItems = generateObservabilityNavItems(ref, project, {
    showReports,
    unifiedLogs: isUnifiedLogsEnabled,
  })

  const integrationsItems = generateIntegrationsNavItems(ref, project, {
    apiDocsSidePanel: isNewAPIDocsEnabled,
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {IS_PLATFORM && <OrgSelector />}
        <ProjectBranchSelector />
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/project/${ref}`}>
                  <Home size={16} strokeWidth={1.5} />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Database" items={databaseItems} />
        <NavGroup label="Platform" items={platformItems} />
        <NavGroup label="Observability" items={observabilityItems} />
        <NavGroup label="Integrations" items={integrationsItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Project Settings">
              <Link
                href={
                  IS_PLATFORM
                    ? `/project/${ref}/settings/general`
                    : `/project/${ref}/settings/log-drains`
                }
              >
                <Settings size={16} />
                <span>Project Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {IS_PLATFORM && <NavUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
