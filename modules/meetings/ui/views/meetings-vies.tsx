'use client'

import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'

export function MeetingsView() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      // page: 1,
      // pageSize: 10,
    }),
  )

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      {JSON.stringify(data.items, null, 2)}
    </div>
  )
}

export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title='Loading meetings'
      description='This may take few seconds'
    />
  )
}

export const MeetingsViewError = () => {
  return (
    <ErrorState
      title='Error loading meetings'
      description='Something went wrong'
    />
  )
}
