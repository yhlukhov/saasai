'use client'

import { createColumnHelper } from '@tanstack/react-table'

import { type DataTableFeatures } from './data-table-features'
import { type AgentGetOne } from '../../types'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { CornerDownRightIcon, VideoIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const columnHelper = createColumnHelper<DataTableFeatures, AgentGetOne>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Agent Name',
    cell: ({ row }) => (
      <div className='flex flex-col gap-y-1'>
        <div className='flex items-center gap-x-2'>
          <GeneratedAvatar
            variant='botttsNeutral'
            seed={row.original.name}
            className='size-8'
          />
          <span>{row.original.name}</span>
        </div>
        <div className='flex items-center gap-x-1'>
          <CornerDownRightIcon className='size-3.5 text-muted-foreground' />
          <span className='text-sm text-muted-foreground overflow-hidden max-w-[300]'>
            {row.original.instructions}
          </span>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('meetingCount', {
    header: 'Meetings',
    cell: ({ row }) => (
      <Badge variant='outline' className='flex items-center gap-x-2 [&>svg]:size-3.5!'>
        <VideoIcon className='text-blue-700'/>
        5 meetings
      </Badge>
    ),
  }),
])
