import type { ReactNode } from 'react'

import { MockRouterProvider } from '../router/MockRouterContext'
import { MockProjectProvider } from './MockProjectContext'
import { MockUserProvider } from './MockUserContext'

interface MockProvidersProps {
  defaultPath: string
  projectName?: string
  organizationName?: string
  organizationPlan?: string
  branchName?: string
  children: ReactNode
}

export function MockProviders({
  defaultPath,
  projectName,
  organizationName,
  organizationPlan,
  branchName,
  children,
}: MockProvidersProps) {
  return (
    <MockRouterProvider defaultPath={defaultPath}>
      <MockProjectProvider
        projectName={projectName}
        organizationName={organizationName}
        organizationPlan={organizationPlan}
        branchName={branchName}
      >
        <MockUserProvider>{children}</MockUserProvider>
      </MockProjectProvider>
    </MockRouterProvider>
  )
}
