'use client'

import { useRouter } from 'next/navigation'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function HomeView() {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  return (
    <div className='p-4 flex flex-col gap-4'>
      <div>
        Logged in as {session?.user.name || 'User'} (
        {session?.user.email || 'No email'})
      </div>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push('/sign-in')
              }
            }
          })
        }
      >
        Sign out
      </Button>
    </div>
  )
}
