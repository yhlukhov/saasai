//-- external imports
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { type SearchParams } from 'nuqs/server'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
//-- internal imports
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from '@/modules/meetings/ui/views/meetings-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { loadSearchParams } from '@/modules/meetings/params'
import { MeetingsListHeader } from '@/modules/meetings/ui/components/meetings-list-header'
import { auth } from '@/lib/auth'

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function MeetingsPage({ searchParams }: Props) {
  const params = await loadSearchParams(searchParams)
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  void queryClient.query(trpc.meetings.getMany.queryOptions({...params}))

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewError />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
