import pgMeta from '@supabase/pg-meta'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { configKeys } from 'data/config/keys'
import { executeSql } from 'data/sql/execute-sql-query'
import { toast } from 'sonner'
import type { ResponseError, UseCustomMutationOptions } from 'types'

import { databaseExtensionsKeys } from './keys'

export type DatabaseExtensionUninstallVariables = {
  projectRef: string
  connectionString?: string | null
  id: string
  cascade?: boolean
}

export async function uninstallDatabaseExtension({
  projectRef,
  connectionString,
  id,
  cascade,
}: DatabaseExtensionUninstallVariables) {
  let headers = new Headers()
  if (connectionString) headers.set('x-connection-encrypted', connectionString)

  const { sql } = pgMeta.extensions.remove(id, { cascade })
  const { result } = await executeSql({
    projectRef,
    connectionString,
    sql,
    queryKey: ['extension', 'delete', id],
  })

  return result
}

type DatabaseExtensionUninstallData = Awaited<ReturnType<typeof uninstallDatabaseExtension>>

export const useDatabaseExtensionUninstallMutation = ({
  onSuccess,
  onError,
  ...options
}: Omit<
  UseCustomMutationOptions<
    DatabaseExtensionUninstallData,
    ResponseError,
    DatabaseExtensionUninstallVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    DatabaseExtensionUninstallData,
    ResponseError,
    DatabaseExtensionUninstallVariables
  >({
    mutationFn: (vars) => uninstallDatabaseExtension(vars),
    async onSuccess(data, variables, context) {
      const { projectRef } = variables
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: databaseExtensionsKeys.list(projectRef) }),
        queryClient.invalidateQueries({ queryKey: configKeys.upgradeEligibility(projectRef) }),
      ])
      await onSuccess?.(data, variables, context)
    },
    async onError(data, variables, context) {
      if (onError === undefined) {
        toast.error(`Failed to uninstall database extension: ${data.message}`)
      } else {
        onError(data, variables, context)
      }
    },
    ...options,
  })
}
