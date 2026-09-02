'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, XCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewAgentDialog } from './new-agent-dialog'
import { useAgentsFilters } from '../../hooks/use-agents-filters'
import { AgentsSearchFilter } from './agents-search-filter'
import { DEFAULT_PAGE } from '@/constants'

export function AgentsListHeader() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useAgentsFilters()
  const isAnyFilterModified = !!filters.search
  const handleClearFilters = () => {
    setFilters({ search: '', page: DEFAULT_PAGE })
  }

  return (
    <>
      <NewAgentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div className='p-4 md:px-8 flex flex-col gap-y-4'>
        <div className='flex items-center justify-between'>
          <h5 className='font-medium text-xl'>My Agents</h5>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon />
            New Agent
          </Button>
        </div>
        <div className='flex items-center gap-x-2 p-1'>
          <AgentsSearchFilter />
          {isAnyFilterModified && (
            <Button variant='outline' size='sm' className='text-muted-foreground' onClick={handleClearFilters}>
              <XCircleIcon />
              Clear
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
