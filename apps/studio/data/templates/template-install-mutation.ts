import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// import { handleError, post } from 'data/fetchers'
import type { ResponseError, UseCustomMutationOptions } from 'types'
import { templateKeys } from './keys'

export type TemplateInstallVariables = {
  projectRef: string
  templateSlug: string
  payload?: Record<string, unknown>
}

export type TemplateInstallResponse = {
  projectRef: string
  templateSlug: string
  status: 'success'
  installedAt: string
}

export async function installTemplate({
  projectRef,
  templateSlug,
  payload,
}: TemplateInstallVariables) {
  if (!projectRef) throw new Error('projectRef is required')
  if (!templateSlug) throw new Error('templateSlug is required')
  void payload

  // const { data, error } = await post('/platform/projects/{ref}/templates/{templateSlug}/install', {
  //   params: { path: { ref: projectRef, templateSlug } },
  //   body: payload,
  // })
  // if (error) handleError(error)
  // return data as TemplateInstallResponse

  return {
    projectRef,
    templateSlug,
    status: 'success',
    installedAt: new Date().toISOString(),
  } satisfies TemplateInstallResponse
}

type TemplateInstallData = Awaited<ReturnType<typeof installTemplate>>

export const useTemplateInstallMutation = ({
  onSuccess,
  onError,
  ...options
}: Omit<
  UseCustomMutationOptions<TemplateInstallData, ResponseError, TemplateInstallVariables>,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<TemplateInstallData, ResponseError, TemplateInstallVariables>({
    mutationFn: (vars) => installTemplate(vars),
    async onSuccess(data, variables, context) {
      const { templateSlug } = variables
      await queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateSlug) })
      await onSuccess?.(data, variables, context)
    },
    async onError(data, variables, context) {
      if (onError === undefined) {
        toast.error(`Failed to install template: ${data.message}`)
      } else {
        onError(data, variables, context)
      }
    },
    ...options,
  })
}
