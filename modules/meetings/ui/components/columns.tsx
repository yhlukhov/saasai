'use client'
//-- external imports
import { format } from 'date-fns'
import humanizeDuration from 'humanize-duration'
import { createColumnHelper } from '@tanstack/react-table'
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  ClockFadingIcon,
  CornerDownRightIcon,
  LoaderIcon,
} from 'lucide-react'
//-- internal imports
import { type DataTableFeatures } from '@/components/data-table-features'
import { type MeetingGetMany } from '../../types'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusIconMap = {
  upcoming: ClockArrowUpIcon,
  active: LoaderIcon,
  completed: CircleCheckIcon,
  processing: LoaderIcon,
  cancelled: CircleXIcon,
}

const statusColorMap = {
  upcoming: 'bg-yellow-500/20 text-yellow-800 border-yellow-800/5',
  active: 'bg-blue-500/20 text-blue-800 border-blue-800/5',
  completed: 'bg-emerald-500/20 text-emerald-800 border-emerald-800/5',
  processing: 'bg-gray-300/20 text-gray-800 border-gray-800/5',
  cancelled: 'bg-rose-500/20 text-rose-800 border-rose-800/5',
}

const columnHelper = createColumnHelper<
  DataTableFeatures,
  MeetingGetMany[number]
>()

function formatDuration(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    largest: 1,
    round: true,
    units: ['h', 'm', 's'],
  })
}

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Meeting Name',
    cell: ({ row }) => (
      <div className='flex flex-col gap-y-1'>
        <span className='font-semibold capitalize'>{row.original.name}</span>
        <div className='flex items-center gap-x-1'>
          <div className='flex items-center gap-x-1'>
            <CornerDownRightIcon className='size-3.5 text-muted-foreground' />
            <span className='text-sm text-muted-foreground overflow-hidden max-w-[300] flex items-center gap-2'>
              {row.original.agent.name}
              <GeneratedAvatar seed={row.original.agent.name} variant='botttsNeutral' className='w-4 h-4' />
            </span>
          </div>
          <span className='text-sm text-muted-foreground'>
            {row.original.startedAt
              ? format(row.original.startedAt, 'MMM d')
              : ''}
          </span>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => {
      const Icon =
        statusIconMap[row.original.status as keyof typeof statusIconMap]
      return (
        <Badge
          variant='outline'
          className={cn(
            'capitalize [&>svg]:size-4 text-muted-foreground',
            statusColorMap[row.original.status as keyof typeof statusColorMap],
          )}
        >
          <Icon
            className={cn(
              row.original.status === 'processing' && 'animate-spin',
            )}
          />
          {row.original.status}
        </Badge>
      )
    },
  }),
  columnHelper.accessor('duration', {
    header: 'Duration',
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='capitalize [&>svg]:size-4 flex items-center gap-x-2'
      >
        <ClockFadingIcon className='text-blue-700' />
        {row.original.duration ? formatDuration(row.original.duration) : "No duration"}
      </Badge>
    ),
  }),
])
