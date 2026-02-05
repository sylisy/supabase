import { useParams } from 'common/hooks/useParams'
import { TemplateInstall } from 'components/interfaces/Templates/TemplateInstall'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { ProjectLayoutWithAuth } from 'components/layouts/ProjectLayout'
import { useTemplateContentsQuery } from 'data/templates/template-contents-query'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { NextPageWithLayout } from 'types'

const TemplateInstallPage: NextPageWithLayout = () => {
  const { ref, templateSlug } = useParams()
  const { data: project } = useSelectedProjectQuery()

  const {
    data: recipe,
    error,
    isLoading,
  } = useTemplateContentsQuery(
    { templateSlug },
    {
      enabled: Boolean(templateSlug),
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-muted" />
          <p className="text-sm text-foreground-light">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!templateSlug || error || !recipe) {
    const errorMessage = !templateSlug ? 'Template slug is required' : error?.message

    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="text-lg font-medium mb-1">Failed to Load Recipe</h3>
            <p className="text-sm text-foreground-light">{errorMessage || 'Recipe not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TemplateInstall
      recipe={recipe}
      projectRef={ref!}
      connectionString={project?.connectionString}
    />
  )
}

TemplateInstallPage.getLayout = (page) => (
  <DefaultLayout>
    <ProjectLayoutWithAuth>{page}</ProjectLayoutWithAuth>
  </DefaultLayout>
)

export default TemplateInstallPage
