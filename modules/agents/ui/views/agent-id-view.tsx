'use client'
import {useState} from 'react'
import { VideoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryClient, useSuspenseQuery, useMutation } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { AgentIdViewHeader } from '../components/agent-id-view-header'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { useConfirm } from '@/hooks/use-confirm'
import { UpdateAgentDialog } from '../components/update-agent-dialog'


interface AgentIdViewProps {
  agentId: string
}

export function AgentIdView({ agentId }: AgentIdViewProps) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const { data: agent } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  )

  const removeAgent = useMutation(trpc.agents.remove.mutationOptions({ 
    onSuccess: async(data, variables: { id: string }) => {
      await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
      //* TODO: Invalidate free tier usage
      router.push('/agents')
    },
    onError: (error) => {
      toast.add({
        title: 'Error removing agent',
        description: error.message
      })
    }
   }))

   const [RemoveConfirmationDialog, confirmRemove] = useConfirm(
    'Are you sure?',
    `This action will permanently remove agent and ${agent.meetingCount} associated meetings`,
  )

  return (
    <>
      <RemoveConfirmationDialog />
      <UpdateAgentDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        initialValues={agent}
      />
      <div className='p-4 flex-1 md:px-8 flex flex-col gap-y-4'>
        <AgentIdViewHeader
          agentId={agent.id}
          agentName={agent.name}
          onEdit={() => setIsUpdateDialogOpen(true)}
          onRemove={async () => {
            const confirmed = await confirmRemove()
            if (confirmed) {
              removeAgent.mutate({ id: agent.id })
            }
          }}
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
    </>
  )
}
