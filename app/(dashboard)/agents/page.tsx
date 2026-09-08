import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { type SearchParams } from 'nuqs'

import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from '@/modules/agents/ui/views/agents-view'
import { AgentsListHeader } from '@/modules/agents/ui/components/agent-list-header'
import { loadSearchParams } from '@/modules/agents/params'
import { getQueryClient, trpc } from '@/trpc/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function AgentsPage({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  void queryClient.query(trpc.agents.getMany.queryOptions({ ...filters }))

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
