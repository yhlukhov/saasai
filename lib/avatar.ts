import { Avatar } from '@dicebear/core'
import botttsNeutral from '@dicebear/styles/bottts-neutral.json'
import initials from '@dicebear/styles/initials.json'

interface Props {
  seed: string
  variant: 'botttsNeutral' | 'initials'
}

export const generateAvatarUri = ({ seed, variant }: Props) => {
  let avatar

  if (variant === 'botttsNeutral') {
    avatar = new Avatar(botttsNeutral, {seed})
  } else {
    avatar = new Avatar(initials, {
      seed, fontWeight: 500, size: 42
    })
  }

  return avatar.toDataUri()
}
