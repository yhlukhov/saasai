import { CommandDialog, CommandInput, CommandItem, CommandList, Command } from "@/components/ui/command"
import { Dispatch, SetStateAction } from "react"

interface Props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export function DashboardCommand({open, setOpen}: Props) {
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder='Find a meeting or agent' />
          <CommandList>
            <CommandItem>Test command</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>
    )
}