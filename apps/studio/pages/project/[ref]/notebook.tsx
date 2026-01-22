import { Notebook } from 'components/interfaces/Notebook/Notebook'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { ProjectLayoutWithAuth } from 'components/layouts/ProjectLayout'
import type { NextPageWithLayout } from 'types'

const NotebookPage: NextPageWithLayout = () => {
  return <Notebook />
}

NotebookPage.getLayout = (page) => (
  <DefaultLayout>
    <ProjectLayoutWithAuth title="Notebook">{page}</ProjectLayoutWithAuth>
  </DefaultLayout>
)

export default NotebookPage
