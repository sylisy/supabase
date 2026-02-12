import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import DefaultLayout from '~/components/Layouts/Default'
import { Conversation } from '~/components/Contribute/Conversation'
import { getThreadById } from '~/data/contribute'
import type { Metadata } from 'next'
import { ContributeGuard } from '../../ContributeGuard'
import PageLoading from './page-loading'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

// eslint-disable-next-line no-restricted-exports
export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const thread = await getThreadById(id)

  if (!thread) {
    notFound()
  }

  return (
    <ContributeGuard>
      <DefaultLayout>
        <main className="min-h-screen flex flex-col items-center">
          <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-16">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 text-foreground-lighter hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to threads
            </Link>

            <Suspense fallback={<PageLoading />}>
              <div className="grid gap-6">
                <Conversation thread={thread} />
              </div>
            </Suspense>
          </div>
        </main>
      </DefaultLayout>
    </ContributeGuard>
  )
}
