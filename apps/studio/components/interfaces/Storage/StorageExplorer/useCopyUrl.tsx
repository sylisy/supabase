import { useCallback } from 'react'
import { toast } from 'sonner'
import { useStorageExplorerStateSnapshot } from 'state/storage-explorer'
import { copyToClipboard } from 'ui'

import { URL_EXPIRY_DURATION } from '../Storage.constants'
import { fetchFileUrl } from './useFetchFileUrlQuery'
import { useProjectApiUrl } from '@/hooks/misc/useProjectApiUrl'

export const useCopyUrl = () => {
  const { projectRef, selectedBucket, getPathAlongOpenedFolders } =
    useStorageExplorerStateSnapshot()

  const { hostEndpoint, customEndpoint } = useProjectApiUrl({ projectRef })
  const isCustomDomainActive = !!customEndpoint

  const getFileUrl = useCallback(
    (fileName: string, expiresIn?: URL_EXPIRY_DURATION) => {
      const pathToFile = getPathAlongOpenedFolders(false)
      const formattedPathToFile = [pathToFile, fileName].join('/')

      return fetchFileUrl(
        formattedPathToFile,
        projectRef,
        selectedBucket.id,
        selectedBucket.public,
        expiresIn
      )
    },
    [projectRef, selectedBucket.id, selectedBucket.public, getPathAlongOpenedFolders]
  )

  const onCopyUrl = useCallback(
    (name: string, expiresIn?: URL_EXPIRY_DURATION) => {
      const formattedUrl = getFileUrl(name, expiresIn).then((url) => {
        return isCustomDomainActive ? url.replace(hostEndpoint, customEndpoint) : url
      })

      return copyToClipboard(formattedUrl, () => {
        toast.success(`Copied URL for ${name} to clipboard.`)
      })
    },
    [customEndpoint, getFileUrl, hostEndpoint, isCustomDomainActive]
  )

  return { onCopyUrl }
}
