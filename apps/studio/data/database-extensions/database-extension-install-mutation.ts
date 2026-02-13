import pgMeta from '@supabase/pg-meta'
import { ident } from '@supabase/pg-meta/src/pg-format'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { configKeys } from 'data/config/keys'
import { executeSql } from 'data/sql/execute-sql-query'
import { toast } from 'sonner'
import type { ResponseError, UseCustomMutationOptions } from 'types'

import { databaseExtensionsKeys } from './keys'

export type DatabaseExtensionInstallVariables = {
  projectRef: string
  connectionString?: string | null
  schema: string
  name: string
  version: string
  cascade?: boolean
  createSchema?: boolean
}

export async function installDatabaseExtension({
  projectRef,
  connectionString,
  schema,
  name,
  version,
  cascade = false,
  createSchema = false,
}: DatabaseExtensionInstallVariables) {
  let headers = new Headers()
  if (connectionString) headers.set('x-connection-encrypted', connectionString)

  const { sql } = pgMeta.extensions.create({ schema, name, version, cascade })
  const { result } = await executeSql({
    projectRef,
    connectionString,
    sql: createSchema ? `create schema if not exists ${ident(schema)}; ${sql}` : sql,
    queryKey: ['extension', 'create'],
  })

  return result
}

type DatabaseExtensionInstallData = Awaited<ReturnType<typeof installDatabaseExtension>>

export const useDatabaseExtensionInstallMutation = ({
  onSuccess,
  onError,
  ...options
}: Omit<
  UseCustomMutationOptions<
    DatabaseExtensionInstallData,
    ResponseError,
    DatabaseExtensionInstallVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    DatabaseExtensionInstallData,
    ResponseError,
    DatabaseExtensionInstallVariables
  >({
    mutationFn: (vars) => installDatabaseExtension(vars),
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
        toast.error(`Failed to install database extension: ${data.message}`)
      } else {
        onError(data, variables, context)
      }
    },
    ...options,
  })
}
