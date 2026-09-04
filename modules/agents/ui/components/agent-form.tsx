import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentsInsertSchema } from '../../schemas'
import { useTRPC } from '@/trpc/client'
import { AgentGetOne } from '../../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { GeneratedAvatar } from '@/components/generated-avatar'

interface AgentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialValues?: AgentGetOne
}

export function AgentForm({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
        onSuccess?.()
      },
      onError: ({message}) => {
        toast.add({title:message})
      },
    }),
  )

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id }),
          )
        }
        onSuccess?.()
      },
      onError: ({ message }) => {
        toast.add({ title: message, actionProps: { style: { zIndex: 9999 } } })
      },
    }),
  )

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      instructions: initialValues?.instructions ?? '',
    },
  })

  const isEdit = !!initialValues?.id
  const isPending = createAgent.isPending || updateAgent.isPending

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent.mutate({ ...values, id: initialValues.id })
    } else {
      createAgent.mutate(values)
    }
  }

  return (
    <form
      className='px-5 py-2 pt-0'
      id='form-sign-up'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <GeneratedAvatar
        seed={form.watch('name')}
        variant='botttsNeutral'
        className='border size-16'
      />
      <FieldGroup>
        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='form-name'>Name:</FieldLabel>
              <Input
                {...field}
                id='form-name'
                type='text'
                aria-invalid={fieldState.invalid}
                placeholder='Agent 007'
                autoComplete='off'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='instructions'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='form-email'>Instructions:</FieldLabel>
              <Textarea
                {...field}
                id='form-instructions'
                aria-invalid={fieldState.invalid}
                placeholder='You are popular movie star spy agent 007'
                autoComplete='off'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className='pt-5 flex justify-between gap-x-2'>
        {onCancel && (
          <Button
            variant='ghost'
            disabled={isPending}
            type='button'
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          className='bg-radial from-green-700 to-green-900'
          disabled={isPending}
        >
          {isEdit ? 'Update agent' : 'Create agent'}
        </Button>
      </div>
    </form>
  )
}
