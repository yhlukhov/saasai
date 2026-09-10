'use client'
//-- external imports
import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
//-- internal imports
import { useTRPC } from '@/trpc/client'
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { DataTable } from '@/components/data-table'
import { columns } from '@/modules/meetings/ui/components/columns'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { NewMeetingDialog } from '../components/new-meeting-dialog'

export function MeetingsView() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      // page: 1,
      // pageSize: 10,
    }),
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className='px-4 pb-4 flex-1 flex-col md:px-8 gap-y-4'>
      <NewMeetingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <DataTable data={data.items} columns={columns} />
      {data.items.length === 0 && (
        <div className='flex flex-col items-center gap-4'>
          <EmptyState
            title='Create your first meeting'
            description='Scedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, interact with participants in real time'
          />
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon />
            New Meeting
          </Button>
        </div>
      )}
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
