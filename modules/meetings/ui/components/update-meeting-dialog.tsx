//-- internal imports
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { MeetingForm } from './meeting-form'
import { MeetingGetOne } from '../../types'

interface UpdateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: MeetingGetOne
}

export function UpdateMeetingDialog({ open, onOpenChange, initialValues }: UpdateMeetingDialogProps) {

  return (
    <ResponsiveDialog
      title='Update Meeting'
      description='Update Meeting details'
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        onSuccess={(id) => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  )
}
