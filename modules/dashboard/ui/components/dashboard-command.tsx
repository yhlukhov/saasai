import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useState } from 'react'
// Internal imports
import { useTRPC } from '@/trpc/client'
import {
  CommandResponsiveDialog,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
  CommandGroup,
  CommandEmpty,
} from '@/components/ui/command'
import { GeneratedAvatar } from '@/components/generated-avatar'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function DashboardCommand({ open, setOpen }: Props) {
  const trpc = useTRPC()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100,
    }),
  )
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100,
    }),
  )

  return (
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput
          placeholder='Find a meeting or agent'
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandGroup heading='Meetings'>
            <CommandEmpty>
              <span className='text-muted-foreground text-sm'>
                No meetings found
              </span>
            </CommandEmpty>
            {meetings.data?.items.map((meeting) => (
              <CommandItem
                key={meeting.id}
                onSelect={() => {
                  router.push(`/meetings/${meeting.id}`)
                  setOpen(false)
                }}
              >
                {meeting.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading='Agents'>
            <CommandEmpty>
              <span className='text-muted-foreground text-sm'>
                No agents found
              </span>
            </CommandEmpty>
            {agents.data?.items.map((agent) => (
              <CommandItem
                key={agent.id}
                onSelect={() => {
                  router.push(`/agents/${agent.id}`)
                  setOpen(false)
                }}
              >
                <GeneratedAvatar
                  seed={agent.name}
                  variant="botttsNeutral"
                  className="size-5"
                />
                {agent.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandResponsiveDialog>
  )
}
