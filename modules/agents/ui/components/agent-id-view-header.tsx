'use client'

import Link from 'next/link'
import { ChevronRightIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface AgentIdViewHeaderProps {
  agentId: string
  agentName: string
  onEdit: () => void
  onRemove: () => void
}

export function AgentIdViewHeader({
  agentId,
  agentName,
  onEdit,
  onRemove,
}: AgentIdViewHeaderProps) {
  return (
    <div
      data-agent-id={agentId}
      className='flex items-center justify-between'
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/agents' />}>
              My Agents
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='font-medium text-xl text-foreground [&>svg]:size-4'>
            <ChevronRightIcon />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbLink
                className='font-medium text-xl text-foreground'
              render={<Link href={`/agents/${agentId}`}>{agentName}</Link>}
            />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Button variant='ghost'>
            <MoreVerticalIcon />
          </Button>
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
