import { EmptyState } from '@/components/empty-state'

export function ProcessingState() {
  return (
    <div className='bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center'>
      <EmptyState
        title='Meeting completed'
        description='The meeting was completed. Summary will appear soon'
        image='/processing.svg'
      />
    </div>
  )
}
