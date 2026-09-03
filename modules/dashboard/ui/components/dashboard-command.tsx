import {
  CommandResponsiveDialog,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from '@/components/ui/command'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function DashboardCommand({ open, setOpen }: Props) {
  return (
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder='Find a meeting or agent' />
        <CommandList>
          <CommandItem>Command 1</CommandItem>
          <CommandItem>Command 2</CommandItem>
        </CommandList>
      </Command>
    </CommandResponsiveDialog>
  )
}
