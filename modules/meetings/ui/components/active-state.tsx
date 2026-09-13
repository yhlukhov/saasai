import Link from 'next/link'
//-- internal imports
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { VideoIcon } from 'lucide-react'

interface Props {
  meetingId: string
}

export function ActiveState({
  meetingId
}: Props) {
  return (
    <div className='bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center'>
      <EmptyState
        title='Meeting is active'
        description='Meeting will end once all participants have left'
        image='/upcoming.svg'
      />
      <div className='flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full mt-4'>
        <Button className='w-full lg:w-auto'>
          <Link
            href={`/call/${meetingId}`}
            className='flex items-center gap-x-2'
          >
            <VideoIcon />
            Join meeting
          </Link>
        </Button>
      </div>
    </div>
  )
}
