import { useParams } from 'common'
import { AppBannerWrapper } from 'components/interfaces/App/AppBannerWrapper'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import { SidebarInset, SidebarProvider } from 'ui'

import { LayoutSidebarProvider } from '../ProjectLayout/LayoutSidebar/LayoutSidebarProvider'
import { ProjectContextProvider } from '../ProjectLayout/ProjectContext'
import { AppSidebarV2 } from './AppSidebarV2'
import { RightRailLayout } from './RightIconRail'

export interface DefaultLayoutV2Props {
  headerTitle?: string
}

/**
 * New three-column layout for the dashboard (V2 navigation).
 *
 * Layout structure:
 * 1. Left sidebar (collapsible) - navigation with groups (Database, Platform, Observability, Integrations)
 * 2. Main content area - page content (no secondary nav bar)
 * 3. Right icon rail - AI, SQL, Alerts, Help panels
 *
 * This replaces DefaultLayout + ProjectLayout + feature-specific layouts (AuthLayout, DatabaseLayout, etc.)
 * when the navigation V2 feature flag is enabled. The key difference is that there is no longer a
 * secondary product menu sidebar - all navigation is handled in the primary sidebar with collapsible groups.
 */
export const DefaultLayoutV2 = ({ children }: PropsWithChildren<DefaultLayoutV2Props>) => {
  const { ref } = useParams()
  const router = useRouter()
  const scope = router.pathname.startsWith('/project') ? 'project' : 'organization'

  return (
    <ProjectContextProvider projectRef={ref}>
      <LayoutSidebarProvider>
        <div className="flex h-screen w-screen flex-col overflow-hidden">
          <AppBannerWrapper />
          <RightRailLayout>
            <SidebarProvider defaultOpen={true} className="h-full min-h-0 overflow-hidden">
              {!router.pathname.startsWith('/account') && <AppSidebarV2 scope={scope} />}
              <SidebarInset className="h-full min-h-0 overflow-hidden">
                <div className="flex h-full min-h-0 flex-1 overflow-hidden">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </RightRailLayout>
        </div>
      </LayoutSidebarProvider>
    </ProjectContextProvider>
  )
}

export default DefaultLayoutV2
