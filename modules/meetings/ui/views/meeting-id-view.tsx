'use client'
//-- external imports
import { useRouter } from 'next/navigation'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
//-- internal imports
import { useTRPC } from '@/trpc/client'
import { toast } from '@/components/ui/toast'
import { LoadingState } from '@/components/loading-state'
import { MeetingIdViewHeader } from '../components/meeting-id-view-header'
import { useConfirm } from '@/hooks/use-confirm'
import { UpdateMeetingDialog } from '../components/update-meeting-dialog'
import { useState } from 'react'
import { UpcomingState } from '../components/upcoming-state'
import { ActiveState } from '../components/active-state'
import { CancelledState } from '../components/cancelled-state'
import { ProcessingState } from '../components/processing-state'

interface Props {
  meetingId: string
}

export function MeetingIdView({ meetingId }: Props) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false)
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  )
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    'Are you sure?',
    'The following action will remove this meeting',
  )

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
        // TODO: Invalidate free tier usage
        router.push('/meetings')
      },
      onError: (error) => {
        toast.add({
          title: 'Error removing meeting',
          description: error.message,
        })
      },
    }),
  )

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove()
    if (!ok) return
    await removeMeeting.mutateAsync({ id: meetingId })
  }

  const isActive = meeting.status === 'active'
  const isUpcoming = meeting.status === 'upcoming'
  const isCancelled = meeting.status === 'cancelled'
  const isCompleted = meeting.status === 'completed'
  const isProcessing = meeting.status === 'processing'

  return (
    <>
      <UpdateMeetingDialog
        initialValues={meeting}
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
      />
      <RemoveConfirmation />
      <MeetingIdViewHeader
        meetingId={meetingId}
        meetingName={meeting.name}
        onEdit={() => {
          setUpdateMeetingDialogOpen(true)
        }}
        onRemove={handleRemoveMeeting}
      />
      <div className='flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4'>
        {isCancelled && <CancelledState />}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isUpcoming && (
          <UpcomingState
            meetingId={meetingId}
            isCancelling={false}
            onCancelMeeting={() => {}}
          />
        )}
        {isCompleted && <div>Completed</div>}
        {isProcessing && <ProcessingState />}
      </div>
    </>
  )
}

export const MeetingIdViewLoading = () => (
  <LoadingState
    title='Loading Meeting'
    description='This may take few seconds'
  />
)

export const MeetingIdViewError = () => (
  <LoadingState
    title='Error Loading Meeting'
    description='Please, try again later'
  />
)
