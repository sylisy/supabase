import { QueryClient, useQuery } from '@tanstack/react-query'
import { executeSql, ExecuteSqlError } from 'data/sql/execute-sql-query'
import { UseCustomQueryOptions } from 'types'
import { z } from 'zod'

import { FUNCTION_PRIVILEGES_SQL } from '../sql/queries/get-function-privileges'
import { privilegeKeys } from './keys'

export type FunctionPrivilegesVariables = {
  projectRef?: string
  connectionString?: string | null
}

const pgFunctionPrivilegesZod = z.object({
  function_id: z.number(),
  schema: z.string(),
  name: z.string(),
  identity_argument_types: z.string(),
  privileges: z.array(
    z.object({
      grantor: z.string(),
      grantee: z.string(),
      privilege_type: z.literal('EXECUTE'),
      is_grantable: z.boolean(),
    })
  ),
})

const pgFunctionPrivilegesArrayZod = z.array(pgFunctionPrivilegesZod)

export type FunctionPrivilegesData = z.infer<typeof pgFunctionPrivilegesArrayZod>
export type FunctionPrivilegesError = ExecuteSqlError

async function getFunctionPrivileges(
  { projectRef, connectionString }: FunctionPrivilegesVariables,
  signal?: AbortSignal
) {
  const { result } = await executeSql(
    {
      projectRef,
      connectionString,
      sql: FUNCTION_PRIVILEGES_SQL,
      queryKey: ['function-privileges'],
    },
    signal
  )

  return result as FunctionPrivilegesData
}

export const useFunctionPrivilegesQuery = <TData = FunctionPrivilegesData>(
  { projectRef, connectionString }: FunctionPrivilegesVariables,
  {
    enabled = true,
    ...options
  }: UseCustomQueryOptions<FunctionPrivilegesData, FunctionPrivilegesError, TData> = {}
) =>
  useQuery<FunctionPrivilegesData, FunctionPrivilegesError, TData>({
    queryKey: privilegeKeys.functionPrivilegesList(projectRef),
    queryFn: ({ signal }) => getFunctionPrivileges({ projectRef, connectionString }, signal),
    enabled: enabled && typeof projectRef !== 'undefined',
    ...options,
  })

export function invalidateFunctionPrivilegesQuery(
  client: QueryClient,
  projectRef: string | undefined
) {
  return client.invalidateQueries({ queryKey: privilegeKeys.functionPrivilegesList(projectRef) })
}
