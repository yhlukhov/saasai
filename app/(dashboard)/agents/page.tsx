import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import {type SearchParams} from 'nuqs'

import { AgentsView } from '@/modules/agents/ui/views/agents-view'
import { AgentsListHeader } from '@/modules/agents/ui/components/agent-list-header'
import { loadSearchParams } from '@/modules/agents/params'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { getQueryClient, trpc } from '@/trpc/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface Props {
  searchParams:Promise<SearchParams>
}

export default async function AgentsPage({searchParams}:Props) {
  const filters = await loadSearchParams(searchParams)

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  void queryClient.query(trpc.agents.getMany.queryOptions({...filters}))

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
