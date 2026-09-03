import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getQueryClient, trpc } from '@/trpc/server'
import { AgentIdView } from '@/modules/agents/ui/views/agent-id-view'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'

interface AgentPageProps {
  params: Promise<{
    agentId: string
  }>
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { agentId } = await params

  const queryClient = getQueryClient()
  void queryClient.query(trpc.agents.getOne.queryOptions({ id: agentId }))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <LoadingState
            title='Loading'
            description='Loading agent details...'
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title='Error'
              description='Failed to load agent details.'
            />
          }
        >
          <AgentIdView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}
