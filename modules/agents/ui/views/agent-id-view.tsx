'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { AgentIdViewHeader } from '../components/agent-id-view-header'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { Badge } from '@/components/ui/badge'
import { VideoIcon } from 'lucide-react'

interface AgentIdViewProps {
  agentId: string
}

export function AgentIdView({ agentId }: AgentIdViewProps) {
  const trpc = useTRPC()
  const { data: agent } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  )
  return (
    <div className='p-4 flex-1 md:px-8 flex flex-col gap-y-4'>
      <AgentIdViewHeader
        agentId={agent.id}
        agentName={agent.name}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      <div className='px-4 py-5 bg-white rounded-lg border flex flex-col gap-y-4'>
        <div className='flex items-center gap-3'>
          <GeneratedAvatar
            variant='botttsNeutral'
            seed={agent.name}
            className='size-10'
          />
          <h2 className='text-xl font-medium'>{agent.name}</h2>
        </div>
        <Badge variant='outline' className='flex items-center gap-x-2'>
          <VideoIcon className='text-blue-700' />
          {agent.meetingCount}{' '}
          {agent.meetingCount === 1 ? 'meeting' : 'meetings'}
        </Badge>
        <div className='flex flex-col gap-y-4'>
          <p className='text-lg font-medium'>Instructions</p>
          <p className='text-neutral-800'>{agent.instructions}</p>
        </div>
      </div>
    </div>
  )
}
