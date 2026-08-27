import { ErrorBoundary } from 'react-error-boundary'
import { getQueryClient, trpc } from '@/trpc/server'
import { AgentsView } from '@/modules/agents/ui/views/agents-view'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { Suspense } from 'react'

export default async function AgentsPage() {
  const queryClient = getQueryClient()
  void queryClient.query(trpc.agents.getMany.queryOptions()).catch(() => {})
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <LoadingState
            title='Loading Agents'
            description='This may take few seconds'
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title='Error loading agents'
              description='Something went wrong. Please, try again later'
            />
          }
        >
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}
