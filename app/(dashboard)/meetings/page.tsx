import { Suspense } from 'react'
import { type SearchParams } from 'nuqs'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { MeetingsView, MeetingsViewError, MeetingsViewLoading } from '@/modules/meetings/ui/views/meetings-vies'
import { getQueryClient, trpc } from '@/trpc/server'

interface Props {
    searchParams: Promise<SearchParams>
}

export default async function MeetingsPage({searchParams}:Props) {
  const queryClient = getQueryClient()
  void queryClient.query(trpc.meetings.getMany.queryOptions({}))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}