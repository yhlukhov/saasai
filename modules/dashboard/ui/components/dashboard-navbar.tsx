'use client'

import { useEffect, useState } from 'react'
import { PanelLeftIcon, PanelLeftCloseIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Kbd } from '@/components/ui/kbd'
import { DashboardCommand } from './dashboard-command'

export function DashboardNavbar() {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(function handleSetCommandOpenWithKeyboard() {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <nav className='flex px-4 pap-x-2 items-center py-3 border-b bg-background'>
        <Button className='size-9' variant={'outline'} onClick={toggleSidebar}>
          {state === 'collapsed' || isMobile ? (
            <PanelLeftIcon />
          ) : (
            <PanelLeftCloseIcon />
          )}
        </Button>
        <Button
          variant={'outline'}
          size={'sm'}
          className='h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground'
          onClick={() => setCommandOpen((open) => !open)}
        >
          <SearchIcon />
          Search
          <Kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
            <span>&#8984;</span>K
          </Kbd>
        </Button>
      </nav>
    </>
  )
}
