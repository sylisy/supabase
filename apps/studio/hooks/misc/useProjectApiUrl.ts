import { useProjectSettingsV2Query } from '@/data/config/project-settings-v2-query'
import { useCustomDomainsQuery } from '@/data/custom-domains/custom-domains-query'

export const useProjectApiUrl = (
  { projectRef }: { projectRef?: string },
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const {
    data: customDomainData,
    error: customDomainsError,
    isPending: isLoadingCustomDomains,
    isSuccess: isSuccessCustomDomains,
    isError: isErrorCustomDomains,
  } = useCustomDomainsQuery({ projectRef }, { enabled })
  const isCustomDomainsActive = customDomainData?.customDomain?.status === 'active'
  const customEndpoint = isCustomDomainsActive
    ? `https://${customDomainData?.customDomain?.hostname}`
    : undefined

  const {
    data: settings,
    error: projectSettingsError,
    isPending: isLoadingProjectSettings,
    isSuccess: isSuccessProjectSettings,
    isError: isErrorProjectSettings,
  } = useProjectSettingsV2Query({ projectRef }, { enabled })
  const protocol = settings?.app_config?.protocol ?? 'https'
  const endpoint = settings?.app_config?.endpoint
  const hostEndpoint = `${protocol}://${endpoint ?? '-'}`

  const resolvedEndpoint = isCustomDomainsActive ? customEndpoint : hostEndpoint

  return {
    data: resolvedEndpoint,
    customEndpoint,
    hostEndpoint,
    error: projectSettingsError || customDomainsError,
    isPending: isLoadingProjectSettings || isLoadingCustomDomains,
    isSuccess: isSuccessProjectSettings && isSuccessCustomDomains,
    isError: isErrorProjectSettings || isErrorCustomDomains,
  }
}
