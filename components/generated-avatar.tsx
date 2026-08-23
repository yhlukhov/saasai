import { Avatar as DiceBearAvatar } from '@dicebear/core'
import { botttsNeutral, initials } from '@dicebear/collection'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface GeneratedAvatarProps {
  seed: string
  className?: string
  variant: 'botttsNeutral' | 'initials'
}

export function GeneratedAvatar({
  seed,
  variant,
  className,
}: GeneratedAvatarProps) {
  // let avatar = new DiceBearAvatar(
  //   variant === 'botttsNeutral' ? botttsNeutral : initials,
  //   {
  //     seed,
  //   },
  // )
  return (
    <Avatar className={cn(className)}>
      {/* <AvatarImage src={avatar.toDataUri()} alt='Avatar' /> */}
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
