import { useQuery } from '@tanstack/react-query'

// import { get, handleError } from 'data/fetchers'
import type { ResponseError, UseCustomQueryOptions } from 'types'
import type { CookbookRecipe } from 'types/cookbook'
import { templateKeys } from './keys'

export type TemplateContentsVariables = {
  templateSlug?: string
}

export async function getTemplateContents(
  { templateSlug }: TemplateContentsVariables,
  signal?: AbortSignal
) {
  if (!templateSlug) throw new Error('templateSlug is required')
  void signal

  // const { data, error } = await get('/platform/templates/{templateSlug}', {
  //   params: { path: { templateSlug } },
  //   signal,
  // })
  // if (error) handleError(error)
  // return data as CookbookRecipe

  return getMockTemplateContents(templateSlug)
}

export type TemplateContentsData = Awaited<ReturnType<typeof getTemplateContents>>
export type TemplateContentsError = ResponseError

export const useTemplateContentsQuery = <TData = TemplateContentsData>(
  { templateSlug }: TemplateContentsVariables,
  {
    enabled = true,
    ...options
  }: UseCustomQueryOptions<TemplateContentsData, TemplateContentsError, TData> = {}
) =>
  useQuery<TemplateContentsData, TemplateContentsError, TData>({
    queryKey: templateKeys.detail(templateSlug),
    queryFn: ({ signal }) => getTemplateContents({ templateSlug }, signal),
    enabled: enabled && typeof templateSlug !== 'undefined',
    ...options,
  })

const getMockTemplateContents = (templateSlug: string): CookbookRecipe => {
  const title = formatTemplateTitle(templateSlug)

  return {
    name: templateSlug,
    title: title || 'Template',
    description: 'Mock template recipe for local development.',
    version: '0.1.0',
    steps: [
      {
        name: 'inputs',
        title: 'Provide setup inputs',
        description: 'Supply values that will be used in the next steps.',
        type: 'input',
        input: {
          fields: {
            tableName: {
              label: 'Table name',
              inputType: 'string',
              required: true,
              default: 'todos',
            },
            defaultVisibility: {
              label: 'Default visibility',
              inputType: 'select',
              options: ['public', 'private'],
              default: 'public',
            },
          },
        },
        output: {
          tableName: '{{input.tableName}}',
          defaultVisibility: '{{input.defaultVisibility}}',
        },
      },
      {
        name: 'create-table',
        title: 'Create the table',
        description: 'Run the SQL to create a starter table.',
        type: 'sql',
        run: {
          content: [
            'create table if not exists {{context.tableName}} (',
            '  id uuid primary key default gen_random_uuid(),',
            '  title text not null,',
            '  visibility text not null default \'{{context.defaultVisibility}}\',',
            '  created_at timestamptz not null default now()',
            ');',
          ].join('\n'),
        },
        output: {
          tableName: '{{context.tableName}}',
        },
      },
    ],
  }
}

const formatTemplateTitle = (templateSlug: string) =>
  templateSlug
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
