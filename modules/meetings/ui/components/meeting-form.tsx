import { z } from 'zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meetingsInsertSchema } from '../../schemas'
import { useTRPC } from '@/trpc/client'
import { MeetingGetOne } from '../../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { CommandSelect } from '@/components/command-select'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { NewAgentDialog } from '@/modules/agents/ui/components/new-agent-dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'

interface MeetingFormProps {
  onSuccess?: (id?: string) => void
  onCancel?: () => void
  initialValues?: MeetingGetOne
}

export function MeetingForm({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false)
  const [agentSearch, setAgentSearch] = useState('')

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    }),
  )

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        )
        // TODO: Invalidate free tier usage
        onSuccess?.(data.id)
      },
      onError: ({ message }) => {
        toast.add({ title: message })
        // TODO: Check if error code is "FORBIDDEN", redirect to "/update"
      },
    }),
  )

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        )
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.meetings.getOne.queryOptions({ id: initialValues.id }),
          )
        }
        onSuccess?.()
      },
      onError: ({ message }) => {
        toast.add({ title: message, actionProps: { style: { zIndex: 9999 } } })
      },
    }),
  )

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      agentId: initialValues?.agentId ?? '',
    },
  })

  const isEdit = !!initialValues?.id
  const isPending = createMeeting.isPending || updateMeeting.isPending

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit) {
      updateMeeting.mutate({ ...values, id: initialValues.id })
    } else {
      createMeeting.mutate(values)
    }
  }

  return (
    <>
      <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
      <form
        className='px-3 py-2 pt-0'
        id='form-sign-up'
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                  placeholder='Daily standup'
                  autoComplete='off'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='agentId'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-name'>Agent</FieldLabel>
                <CommandSelect
                  options={(agents.data?.items ?? []).map((agent) => ({
                    id: agent.id,
                    value: agent.id,
                    children: (
                      <div className='flex items-center gap-x-2'>
                        <GeneratedAvatar
                          seed={agent.name}
                          variant='botttsNeutral'
                          className='border size-6'
                        />
                        <span>{agent.name}</span>
                      </div>
                    ),
                  }))}
                  onSelect={field.onChange}
                  onSearch={setAgentSearch}
                  value={field.value}
                  placeholder='Select an agent'
                />
                <FieldDescription>
                  Not found appropriate agent?{' '}
                  <button
                    type='button'
                    className='text-primary hover:underline'
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    Create new agent
                  </button>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
            {isEdit ? 'Update meeting' : 'Create meeting'}
          </Button>
        </div>
      </form>
    </>
  )
}
