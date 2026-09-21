'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
//-- internal imports:
import { useTRPC } from '@/trpc/client'
import { ErrorState } from '@/components/error-state'
import { CallProvider } from '../components/call-provider'

interface Props {
  meetingId: string
}

export function CallView({ meetingId }: Props) {
  const trpc = useTRPC()
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  )

  if(meeting.status === 'completed') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <ErrorState
          title='Meeting has ended'
          description='You can no longer join this meeting'
        />
      </div>
    )
  }

  return <CallProvider meetingId={meetingId} meetingName={meeting.name} />
}
