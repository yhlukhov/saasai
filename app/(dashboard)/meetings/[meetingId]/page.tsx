//-- external imports
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
//-- internal imports
import { auth } from '@/lib/auth'
import { getQueryClient, trpc } from '@/trpc/server'
import { MeetingIdView, MeetingIdViewError, MeetingIdViewLoading } from '@/modules/meetings/ui/views/meeting-id-view'

interface Props {
  params: Promise<{
    meetingId: string
  }>
}

export default async function MeetingPage({ params }: Props) {
  const { meetingId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  void queryClient.query(trpc.meetings.getOne.queryOptions({ id: meetingId }))
  // TODO: Prefetch `meetings.getTranscript`

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingIdViewLoading />}>
        <ErrorBoundary fallback={<MeetingIdViewError />}>
          <MeetingIdView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}
