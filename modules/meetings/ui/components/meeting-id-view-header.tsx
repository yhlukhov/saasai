'use client'

import Link from 'next/link'
import {
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  MoreVerticalIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MeetingIdViewHeaderProps {
  meetingId: string
  meetingName: string
  onEdit: () => void
  onRemove: () => void
}

export function MeetingIdViewHeader({
  meetingId,
  meetingName,
  onEdit,
  onRemove,
}: MeetingIdViewHeaderProps) {
  return (
    <div
      data-meeting-id={meetingId}
      className='flex items-center justify-between'
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/meetings' />}>
              My Meetings
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='font-medium text-xl text-foreground [&>svg]:size-4'>
            <ChevronRightIcon />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink
              className='font-medium text-xl text-foreground'
              render={
                <Link href={`/meetings/${meetingId}`}>{meetingName}</Link>
              }
            />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={<Button variant='ghost' aria-label='Meeting actions' />}
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className='size-4 text-black' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove}>
            <TrashIcon className='size-4 text-black' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
