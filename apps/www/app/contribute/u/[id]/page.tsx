import { Suspense } from 'react'
import DefaultLayout from '~/components/Layouts/Default'
import { BackToThreadsLink } from '~/components/Contribute/BackToThreadsLink'
import { UserProfile } from '~/components/Contribute/UserProfile'
import type { Metadata } from 'next'
import { ContributeGuard } from '../../ContributeGuard'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

function UserProfileLoading() {
  return (
    <div className="border border-border rounded-lg p-8 text-center text-muted-foreground bg-surface-200">
      Loading user profile...
    </div>
  )
}

// eslint-disable-next-line no-restricted-exports
export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const username = decodeURIComponent(id)

  return (
    <ContributeGuard>
      <DefaultLayout>
        <main className="min-h-screen flex flex-col items-center">
          <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-16">
            <BackToThreadsLink />

            <Suspense fallback={<UserProfileLoading />}>
              <UserProfile username={username} />
            </Suspense>
          </div>
        </main>
      </DefaultLayout>
    </ContributeGuard>
  )
}
