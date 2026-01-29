import { useParams } from 'common'
import { CalendarIcon, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Modal } from 'ui'
import { Form_Shadcn_ } from 'ui'
import {
  SelectContent_Shadcn_,
  SelectGroup_Shadcn_,
  SelectItem_Shadcn_,
  SelectTrigger_Shadcn_,
  SelectValue_Shadcn_,
  Select_Shadcn_,
} from 'ui'

import { DatePicker } from 'components/ui/DatePicker'
import { useOrganizationMembersQuery } from 'data/organizations/organization-members-query'
import { useDatabaseRolesQuery } from 'data/database-roles/database-roles-query'
import { useSelectedOrganizationQuery } from 'hooks/misc/useSelectedOrganization'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { format } from 'date-fns'
import dayjs from 'dayjs'

const FormSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  roles: z
    .array(
      z.object({
        role: z.string(),
        expires_at: z.date().optional(),
      })
    )
    .min(1, 'Please select at least one role'),
})

interface AddUserAccessModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (values: {
    userId: string
    userName: string
    userEmail: string
    roles: Array<{ role: string; expires_at?: Date }>
  }) => void
  isSubmitting?: boolean
  editMode?: {
    userId: string
    userName: string
    userEmail: string
    currentRoles: Array<{ role: string; expires_at?: Date }>
  }
  usersWithAccess?: string[] // Array of user IDs who already have access
}

const AddUserAccessModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  editMode,
  usersWithAccess = [],
}: AddUserAccessModalProps) => {
  const formId = 'add-user-access-form'
  const { ref } = useParams()
  const { data: project } = useSelectedProjectQuery()
  const { data: organization } = useSelectedOrganizationQuery()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userId: '',
      roles: [],
    },
  })

  // Update form when editMode changes or modal opens
  useEffect(() => {
    if (visible) {
      if (editMode) {
        form.reset({
          userId: editMode.userId,
          roles: editMode.currentRoles,
        })
      } else {
        form.reset({
          userId: '',
          roles: [],
        })
      }
    }
  }, [editMode, visible, form])

  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembersQuery({
    slug: organization?.slug,
  })

  // Filter out users who already have access (only in add mode)
  const availableMembers = !editMode
    ? members?.filter((m) => !usersWithAccess.includes(m.gotrue_id ?? m.primary_email))
    : members

  const { data: databaseRoles, isLoading: isLoadingRoles } = useDatabaseRolesQuery({
    projectRef: ref,
    connectionString: project?.connectionString,
  })

  // Filter out system roles and roles that shouldn't be assigned
  // and roles that can not login to the database
  const assignableRoles =
    databaseRoles?.filter(
      (role) =>
        role.canLogin &&
        !role.is_superuser &&
        !role.name.startsWith('pg_') &&
        (!role.name.startsWith('supabase_') || role.name == 'supabase_read_only_user') &&
        !['pgbouncer', 'authenticator'].find((x) => x == role.name)
    ) ?? []

  const handleFormSubmit = async (values: z.infer<typeof FormSchema>) => {
    const selectedMember = members?.find(
      (m) => m.gotrue_id === values.userId || m.primary_email === values.userId
    )

    if (!selectedMember) {
      toast.error('Selected user not found')
      return
    }

    onSubmit({
      userId: selectedMember.gotrue_id ?? values.userId,
      userName: selectedMember.username ?? '',
      userEmail: selectedMember.primary_email,
      roles: values.roles,
    })
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const toggleRole = (roleName: string) => {
    const currentRoles = form.getValues('roles')
    const roleExists = currentRoles.some((r) => r.role === roleName)

    if (roleExists) {
      // Remove role
      const newRoles = currentRoles.filter((r) => r.role !== roleName)
      form.setValue('roles', newRoles, { shouldValidate: true })
    } else {
      // Add role with no expiry date
      const newRoles = [...currentRoles, { role: roleName, expires_at: undefined }]
      form.setValue('roles', newRoles, { shouldValidate: true })
    }
  }

  const updateRoleExpiry = (roleName: string, expires_at: Date | undefined) => {
    const currentRoles = form.getValues('roles')
    const newRoles = currentRoles.map((r) => (r.role === roleName ? { ...r, expires_at } : r))
    form.setValue('roles', newRoles, { shouldValidate: true })
  }

  const selectedUserId = form.watch('userId')
  const selectedRoles = form.watch('roles')

  return (
    <Modal
      hideFooter
      size="medium"
      visible={visible}
      onCancel={handleClose}
      header={editMode ? 'Edit user database access' : 'Add user database access'}
    >
      <Form_Shadcn_ {...form}>
        <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)} className="!border-t-0">
          <>
            <Modal.Content className="space-y-6">
              <p className="text-sm text-foreground-light">
                {editMode
                  ? 'Update the roles assigned to this user. The expiry date applies to all roles.'
                  : 'Grant a user just-in-time access to your database by assigning them one or more PostgreSQL roles. Optionally set an expiry date for automatic access revocation.'}
              </p>

              {/* User Selection */}
              <div className="space-y-2">
                <label className="text-sm" htmlFor="userId">
                  User
                </label>
                {editMode ? (
                  <div className="flex items-center space-x-2 p-3 bg-surface-100 rounded-md border">
                    <div className="flex flex-col">
                      <span className="text-sm">{editMode.userEmail}</span>
                      {editMode.userName && (
                        <span className="text-xs text-foreground-lighter">{editMode.userName}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Select_Shadcn_
                    value={selectedUserId}
                    onValueChange={(value) =>
                      form.setValue('userId', value, { shouldValidate: true })
                    }
                    disabled={isLoadingMembers}
                  >
                    <SelectTrigger_Shadcn_ className="w-full">
                      <SelectValue_Shadcn_ placeholder="Select a user..." />
                    </SelectTrigger_Shadcn_>
                    <SelectContent_Shadcn_>
                      <SelectGroup_Shadcn_>
                        {availableMembers?.map((member) => {
                          const userId = member.gotrue_id
                          return (
                            <SelectItem_Shadcn_ key={userId} value={userId}>
                              <div className="flex flex-col">
                                <span>{member.primary_email}</span>
                                {member.username && (
                                  <span className="text-xs text-foreground-lighter">
                                    {member.username}
                                  </span>
                                )}
                              </div>
                            </SelectItem_Shadcn_>
                          )
                        })}
                      </SelectGroup_Shadcn_>
                    </SelectContent_Shadcn_>
                  </Select_Shadcn_>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm">PostgreSQL Roles</label>
                <div className="border rounded-md max-h-96 overflow-y-auto">
                  {isLoadingRoles ? (
                    <div className="p-4 text-sm text-foreground-light">Loading roles...</div>
                  ) : assignableRoles.length === 0 ? (
                    <div className="p-4 text-sm text-foreground-light">
                      No assignable roles found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {assignableRoles.map((role) => {
                        const roleData = selectedRoles.find((r) => r.role === role.name)
                        const isSelected = !!roleData

                        return (
                          <div key={role.name} className="p-3 hover:bg-surface-100">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRole(role.name)}
                                className="rounded border-control mt-1"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="text-sm font-medium">{role.name}</div>
                                {isSelected && (
                                  <div className="flex items-center gap-2">
                                    <DatePicker
                                      selectsRange={false}
                                      triggerButtonType="default"
                                      triggerButtonSize="tiny"
                                      to={roleData?.expires_at?.toISOString()}
                                      minDate={new Date()}
                                      onChange={({ to }) => {
                                        updateRoleExpiry(role.name, to ? new Date(to) : undefined)
                                      }}
                                      hideClear={false}
                                    >
                                      {roleData?.expires_at
                                        ? format(roleData.expires_at, 'PPp')
                                        : 'Set expiry date'}
                                    </DatePicker>
                                    {roleData?.expires_at && (
                                      <Button
                                        type="text"
                                        size="tiny"
                                        icon={<X className="h-3 w-3" />}
                                        onClick={() => updateRoleExpiry(role.name, undefined)}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {selectedRoles.length > 0 && (
                  <p className="text-xs text-foreground-light">
                    Selected {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </Modal.Content>

            <Modal.Separator />

            <Modal.Content className="flex items-center justify-end space-x-2">
              <Button type="default" disabled={isSubmitting} onClick={handleClose}>
                Cancel
              </Button>
              <Button
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting || !form.formState.isValid || selectedRoles.length === 0}
              >
                {editMode ? 'Update access' : 'Grant access'}
              </Button>
            </Modal.Content>
          </>
        </form>
      </Form_Shadcn_>
    </Modal>
  )
}

export default AddUserAccessModal
