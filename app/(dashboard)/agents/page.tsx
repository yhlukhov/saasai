import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { AgentsView } from '@/modules/agents/ui/views/agents-view'
import { AgentsListHeader } from '@/modules/agents/ui/components/agent-list-header'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { getQueryClient, trpc } from '@/trpc/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AgentsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if(!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  void queryClient.query(trpc.agents.getMany.queryOptions()).catch(() => {})

  return (
    <>
      <AgentsListHeader />
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
    </>
  )
}
