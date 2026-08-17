'use client'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {InputGroup} from "@/components/ui/input-group";

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { data: session } = authClient.useSession()

  const signUp = async () => {
    await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onError: (ctx) => {
          window.alert('Error signing up: ' + ctx.error.message)
        },
        onSuccess: (ctx) => {
          window.alert('User created successfully: ' + ctx.data.user.id)
        },
      },
    )
  }

  const signIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx) => {
          window.alert('Error signing in: ' + ctx.error.message)
        },
        onSuccess: (ctx) => {
          window.alert('User signed in successfully: ' + ctx.data.user.id)
        },
      },
    )
  }

  if (session) {
    console.log('Session:', session)
    return (
      <div className='p-4 flex flex-col gap-4'>
        <div>Logged in as {session.user.name} ({session.user.email})</div>
        <Button onClick={() => authClient.signOut()}>Sign out</Button>
      </div>
    )
  }

  return (
    <div className='p-4 flex flex-col gap-4'>
      <InputGroup className='h-full w-auto p-4 m-4 flex flex-col gap-4'>
        <Input
          type='text'
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={signUp}>Create user</Button>
      </InputGroup>
      <div className="text-center">Or...</div>
      <InputGroup className='h-full w-auto p-4 m-4 flex flex-col gap-4'>
        <Input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={signIn}>Login</Button>
      </InputGroup>
    </div>
  )
}
