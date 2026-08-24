import { Avatar as DiceBearAvatar, Style } from '@dicebear/core'
import botttsNeutral from '@dicebear/styles/bottts-neutral.json'
import initials from '@dicebear/styles/initials.json'

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
  const style = new Style(variant === 'botttsNeutral' ? botttsNeutral : initials)
  const avatar = new DiceBearAvatar(style, {
    seed,
  })
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatar.toDataUri()} alt='Avatar' />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
