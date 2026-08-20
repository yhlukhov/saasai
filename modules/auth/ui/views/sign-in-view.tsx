'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OctagonAlertIcon } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import Link from 'next/link'

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export function SignInView() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: session } = authClient.useSession()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = ({ email, password }: z.infer<typeof signInSchema>) => {
    setError(null)
    setLoading(true)
    authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => router.push('/'),
        onError: ({error}) => setError(error.message),
      },
    ).finally(() => setLoading(false))
  }

  if (session) {
    return (
      <Card className='p-4'>
        <div>
          Logged in as {session.user.name} ({session.user.email})
        </div>
        <Button onClick={() => authClient.signOut()}>Sign out</Button>
      </Card>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card className='p-0 overflow-hidden'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form
            className='p-6'
            id='form-sign-in'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <h1 className='text-2xl font-semibold text-center'>Welcome back</h1>
            <p className='text-sm text-muted-foreground mb-4 text-center'>
              Sign in to your account to continue
            </p>
            <FieldGroup>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-email'>Email:</FieldLabel>
                    <Input
                      {...field}
                      id='form-email'
                      type='email'
                      aria-invalid={fieldState.invalid}
                      placeholder='email@example.com'
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-password'>Password:</FieldLabel>
                    <Input
                      {...field}
                      id='form-password'
                      type='password'
                      aria-invalid={fieldState.invalid}
                      placeholder='********'
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {error && (
              <Alert variant='destructive' className='mt-4'>
                <OctagonAlertIcon className='w-4 h-4' />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            <Button
              type='submit'
              className='w-full mt-4 bg-radial from-green-700 to-green-900'
              disabled={loading}
            >
              Sign In
            </Button>
            <div className='my-4 after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
              <span className='bg-card text-muted-foreground relative z-10 px-2'>
                Or continue with
              </span>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Button variant='outline' type='button' className='w-full' disabled={loading}>
                Google
              </Button>
              <Button variant='outline' type='button' className='w-full' disabled={loading}>
                GitHub
              </Button>
            </div>
            <div className='text-sm text-center mt-8'>
              <div>Don&#39;t have an account?</div>
              <Link href='/sign-up' className='underline underline-offset-4'>
                Sign up
              </Link>
            </div>
          </form>
          <div className='bg-radial from-green-700 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center'>
            <img src='/logo.svg' alt='Image' className='h-[100px] w-[100px]' />
            <div className='text-2xl font-semibold text-white'>Meet.AI</div>
          </div>
        </CardContent>
      </Card>
      <div className='text-muted-foreground *:[a]:hover:text-primary text-sm text-center text-balance *:[a]:underline'>
        By clicking continue, you agree to our{' '}
        <a href='/terms'>Terms of Service</a> and{' '}
        <a href='/privacy'>Privacy Policy</a>
      </div>
    </div>
  )
}
