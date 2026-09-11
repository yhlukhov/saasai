import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'

import { SearchFilterOption } from '@/types'
import { useAgentsFilters } from '@/modules/agents/hooks/use-agents-filters'
import { useMeetingsFilters } from '@/modules/meetings/hooks/use-meetings-filters'

interface Props {
  option: SearchFilterOption
}

export function SearchFilter({ option }: Props) {
  const [filters, setFilters] =
    option === SearchFilterOption.Meetings
      ? useMeetingsFilters()
      : useAgentsFilters()
  return (
    <div className='relative'>
      <Input
        placeholder='Filter by name'
        className='h-9 bg-white w-50 pl-7'
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <SearchIcon className='size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
    </div>
  )
}
