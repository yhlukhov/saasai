import {Button} from '@/components/ui/button'

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const DataPagination: React.FC<Props> = ({
  page,
  totalPages,
  onPageChange,
}) => {
    return (
      <div className='flex items-center justify-center mt-1'>

          <Button variant='outline' onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
            Prev
          </Button>
          <span className='mx-2 text-sm text-muted-foreground'>
            {page} of {totalPages || 1}
          </span>
          <Button
            variant='outline'
            onClick={() => onPageChange(Math.min(totalPages || 1, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        
      </div>
    )
}
