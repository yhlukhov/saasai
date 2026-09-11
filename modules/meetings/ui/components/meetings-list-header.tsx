'use client'
/// -- external imports
import { useState } from 'react'
import { PlusIcon, XCircleIcon } from 'lucide-react'
/// -- internal imports
import { SearchFilterOption } from '@/types'
import { StatusFilter } from './status-filter'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { AgentIdFilter } from './agent-id-filter'
import { NewMeetingDialog } from './new-meeting-dialog'
import { SearchFilter } from '@/components/search-filter'
import { useMeetingsFilters } from '../../hooks/use-meetings-filters'
import { DEFAULT_PAGE } from '@/constants'

export function MeetingsListHeader() {
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [filters, setFilters] = useMeetingsFilters()
  const isFilterModified =
    !!filters.status || !!filters.search || !!filters.agentId

  const onClearFilters = () => {
    setFilters({
      agentId: '',
      search: '',
      status: null,
      page: DEFAULT_PAGE,
    })
  }

  return (
    <>
      <NewMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
      />
      <div className='p-4 md:px-8 flex flex-col gap-y-4'>
        <div className='flex items-center justify-between'>
          <h5 className='font-medium text-xl'>My Meetings</h5>
          <Button
            onClick={() => {
              setMeetingDialogOpen(true)
            }}
          >
            <PlusIcon />
            New Meeting
          </Button>
        </div>
        <ScrollArea>
          <div className='flex items-center gap-x-2 p-1'>
            <SearchFilter option={SearchFilterOption.Meetings} />
            <StatusFilter />
            <AgentIdFilter />
            {isFilterModified && (
              <Button
                variant='outline'
                size='sm'
                className='text-muted-foreground'
                onClick={onClearFilters}
              >
                <XCircleIcon />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>
    </>
  )
}
