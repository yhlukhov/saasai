import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { type SearchParams } from 'nuqs'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { MeetingsView, MeetingsViewError, MeetingsViewLoading } from '@/modules/meetings/ui/views/meetings-vies'
import { getQueryClient, trpc } from '@/trpc/server'
import { MeetingsListHeader } from '@/modules/meetings/ui/components/meetings-list-header'
import { auth } from '@/lib/auth'

interface Props {
    searchParams: Promise<SearchParams>
}

export default async function MeetingsPage({searchParams}:Props) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session) {
    redirect('/sign-in')
  }
  
  const queryClient = getQueryClient()
  void queryClient.query(trpc.meetings.getMany.queryOptions({}))

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