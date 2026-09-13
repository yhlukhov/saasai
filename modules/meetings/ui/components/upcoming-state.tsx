import Link from 'next/link'
//-- internal imports
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { VideoIcon, BanIcon } from 'lucide-react'

interface Props {
  meetingId: string
  onCancelMeeting: () => void
  isCancelling: boolean
}

export function UpcomingState({
  meetingId,
  isCancelling,
  onCancelMeeting,
}: Props) {
  return (
    <div className='bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center'>
      <EmptyState
        title='Not started yet'
        description='Once yous start this meeting, a summary will apper here'
        image='/upcoming.svg'
      />
      <div className='flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full mt-4'>
        <Button
          variant='secondary'
          className='w-full lg:w-auto'
          onClick={onCancelMeeting}
          disabled={isCancelling}
        >
          <BanIcon />
          Cancel meeting
        </Button>
        <Button className='w-full lg:w-auto' disabled={isCancelling}>
          <Link
            href={`/call/${meetingId}`}
            className='flex items-center gap-x-2'
          >
            <VideoIcon />
            Start meeting
          </Link>
        </Button>
      </div>
    </div>
  )
}
