'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { columns } from '../components/columns'
import { DataTable } from '../components/data-table'
import { DataPagination } from '../components/data-pagination'
import { NewAgentDialog } from '../components/new-agent-dialog'
import { useAgentsFilters } from '../../hooks/use-agents-filters'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'

export function AgentsView() {
  const trpc = useTRPC()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useAgentsFilters()
  const {
    data: { items, totalPages },
  } = useSuspenseQuery(trpc.agents.getMany.queryOptions({...filters}))

  return (
    <div className='flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4'>
      <DataTable columns={columns} data={items} onRowClick={(row) => router.push(`/agents/${row.id}`)} />
      <DataPagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      <NewAgentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      {items.length === 0 && (
        <div className='flex flex-col items-center gap-4'>
          <EmptyState
            title='Create your first agent'
            description='Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call'
          />
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon />
            New Agent
          </Button>
        </div>
      )}
    </div>
  )
}
