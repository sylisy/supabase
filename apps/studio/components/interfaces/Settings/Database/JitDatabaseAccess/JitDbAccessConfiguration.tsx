import { PermissionAction } from '@supabase/shared-types/out/constants'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useParams } from 'common'
import { DocsButton } from 'components/ui/DocsButton'

import { useProjectSettingsV2Query } from 'data/config/project-settings-v2-query'
import { useJitDbAccessQuery } from 'data/jit-db-access/jit-db-access-query'
import { useJitDbAccessUpdateMutation } from 'data/jit-db-access/jit-db-access-update-mutation'
import { useJitDbAccessGrantMutation } from 'data/jit-db-access/jit-db-access-grant-mutation'
import { useJitDbAccessRevokeMutation } from 'data/jit-db-access/jit-db-access-revoke-mutation'
import { useJitDbAccessMembersQuery } from 'data/jit-db-access/jit-db-access-members-query'
import { useAsyncCheckPermissions } from 'hooks/misc/useCheckPermissions'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { ButtonTooltip } from 'components/ui/ButtonTooltip'
import AddUserAccessModal from './AddUserAccessModal'
import MembersView from './JitDbAccessMembersView'

import { DOCS_URL } from 'lib/constants'
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'ui'
import {
  PageSection,
  PageSectionContent,
  PageSectionMeta,
  PageSectionSummary,
  PageSectionTitle,
} from 'ui-patterns'
import { FormLayout } from 'ui-patterns/form/Layout/FormLayout'

const JitDbAccessConfiguration = () => {
  const { ref } = useParams()
  const { data: project } = useSelectedProjectQuery()
  const [isEnabled, setIsEnabled] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<
    | {
        userId: string
        userName: string
        userEmail: string
        currentRoles: Array<{ role: string; expires_at?: Date }>
      }
    | undefined
  >(undefined)

  const {
    data: jitDbAccessConfiguration,
    isLoading,
    isSuccess,
  } = useJitDbAccessQuery({
    projectRef: ref,
  })

  const { data: jitMembers = [] } = useJitDbAccessMembersQuery({
    projectRef: ref,
  })
  const { mutate: updateJitDbAccess, isLoading: isSubmitting } = useJitDbAccessUpdateMutation({
    onSuccess: () => {
      toast.success('Successfully updated just-in-time (JIT) database access configuration')
    },
    onError: (error) => {
      setIsEnabled(initialIsEnabled)
      toast.error(
        `Failed to update just-in-time (JIT) database access enforcement: ${error.message}`
      )
    },
  })

  const { mutate: grantUserAccess, isLoading: isGranting } = useJitDbAccessGrantMutation({
    onSuccess: () => {
      toast.success(
        editingUser ? 'Successfully updated user access' : 'Successfully granted user access'
      )
      setShowAddUserModal(false)
      setEditingUser(undefined)
    },
    onError: (error) => {
      toast.error(`Failed to ${editingUser ? 'update' : 'grant'} user access: ${error.message}`)
    },
  })

  const { mutate: revokeUserAccess, isLoading: isRevoking } = useJitDbAccessRevokeMutation({
    onSuccess: () => {
      toast.success('Successfully revoked user access')
    },
    onError: (error) => {
      toast.error(`Failed to revoke user access: ${error.message}`)
    },
  })

  const { can: canUpdateJitDbAccess } = useAsyncCheckPermissions(
    PermissionAction.UPDATE,
    'projects',
    {
      resource: {
        project_id: project?.id,
      },
    }
  )
  const initialIsEnabled = isSuccess
    ? jitDbAccessConfiguration.appliedSuccessfully && jitDbAccessConfiguration.state == 'enabled'
    : false

  const hasAccessToJitDbAccess = !(
    jitDbAccessConfiguration !== undefined &&
    'isUnavailable' in jitDbAccessConfiguration &&
    jitDbAccessConfiguration.isUnavailable
  )
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod' ? 'prod' : 'staging'

  useEffect(() => {
    if (!isLoading && jitDbAccessConfiguration) {
      setIsEnabled(initialIsEnabled)
    }
  }, [isLoading])

  const toggleJitDbAccess = async () => {
    if (!ref) return console.error('Project ref is required')
    setIsEnabled(!isEnabled)
    updateJitDbAccess({
      projectRef: ref,
      requestedConfig: { state: !isEnabled ? 'enabled' : 'disabled' },
    })
  }

  const handleGrantAccess = (values: {
    userId: string
    userName: string
    userEmail: string
    roles: Array<{ role: string; expires_at?: Date }>
  }) => {
    if (!ref) return console.error('Project ref is required')

    // Convert Date objects to Unix timestamps (seconds) for each role
    const rolesWithTimestamps = values.roles.map((r) => ({
      role: r.role,
      expires_at: r.expires_at ? Math.floor(r.expires_at.getTime() / 1000) : undefined,
    }))

    grantUserAccess({
      projectRef: ref,
      userId: values.userId,
      roles: rolesWithTimestamps,
    })
  }

  const handleRevokeAccess = (userId: string, userEmail: string) => {
    if (!ref) return console.error('Project ref is required')

    revokeUserAccess({
      projectRef: ref,
      userId,
    })
  }

  return (
    <>
      <PageSection id="jit-db-access-configuration">
        <PageSectionMeta>
          <PageSectionSummary>
            <PageSectionTitle>Just-in-time (JIT) database access</PageSectionTitle>
          </PageSectionSummary>
          <DocsButton href={`${DOCS_URL}/guides/platform/just-in-time-database-access`} />
        </PageSectionMeta>
        <PageSectionContent>
          {!hasAccessToJitDbAccess && (
            <Alert
              withIcon
              variant="warning"
              title="Just-in-time database access is unavailable"
              className="mb-4"
            >
              Your project does not have access to just-in-time database access. This feature
              requires Postgres version 17 or later. Please{' '}
              <Link
                href={`/project/${ref}/settings/infrastructure`}
                className="underline font-medium"
              >
                upgrade your database
              </Link>{' '}
              to the latest Postgres version to enable this feature.
            </Alert>
          )}
          {hasAccessToJitDbAccess && (
            <Card>
              <CardContent className="space-y-4">
                <FormLayout
                  layout="flex-row-reverse"
                  label="Enable JIT database access"
                  description="Allow JIT access to your database using Personal Access Tokens (PAT)."
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="flex items-center justify-end mt-2.5 space-x-2">
                        {(isLoading || isSubmitting) && (
                          <Loader2 className="animate-spin" strokeWidth={1.5} size={16} />
                        )}
                        {isSuccess && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* [Joshen] Added div as tooltip is messing with data state property of toggle */}
                              <div>
                                <Switch
                                  size="large"
                                  checked={isEnabled}
                                  disabled={
                                    isLoading ||
                                    isSubmitting ||
                                    !canUpdateJitDbAccess ||
                                    !hasAccessToJitDbAccess
                                  }
                                />
                              </div>
                            </TooltipTrigger>
                            {(!canUpdateJitDbAccess || !hasAccessToJitDbAccess) && (
                              <TooltipContent side="bottom" className="w-64 text-center">
                                {!canUpdateJitDbAccess
                                  ? 'You need additional permissions to update Just-in-time database access for your project'
                                  : !hasAccessToJitDbAccess
                                    ? 'Your project does not have access to Just-in-time database access. Please update to the latest Postgres version'
                                    : undefined}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        )}
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="medium">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {jitDbAccessConfiguration?.state !== 'enabled'
                            ? 'Access must be configured'
                            : 'Users will lose access'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {jitDbAccessConfiguration?.state !== 'enabled'
                            ? 'Access via JIT must be granted on a per user basis. Any existing mappings will immediately become active when JIT access is enabled. Confirm to proceed now?'
                            : 'Users with JIT access will no longer be able to connect. The user to role mappings will not be removed and access will automatically be restored if JIT access is re-enabled. Confirm to proceed now?'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="warning"
                          disabled={isSubmitting}
                          onClick={toggleJitDbAccess}
                        >
                          {jitDbAccessConfiguration?.state !== 'enabled'
                            ? 'Enable JIT Access'
                            : 'Disable JIT Access'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </FormLayout>
                {isSuccess && !jitDbAccessConfiguration?.appliedSuccessfully && (
                  <Alert withIcon variant="warning" title="JIT access was not updated successfully">
                    Please try updating again, or contact support if this error persists
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          {isEnabled && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">User Access</h3>
                  <p className="text-sm text-foreground-light">
                    Manage which users have JIT database access
                  </p>
                </div>
                <Button
                  type="default"
                  icon={<Plus />}
                  onClick={() => setShowAddUserModal(true)}
                  disabled={!canUpdateJitDbAccess}
                >
                  Add user
                </Button>
              </div>
              <MembersView
                onEditUser={(user) => {
                  setEditingUser(user)
                  setShowAddUserModal(true)
                }}
                onRevokeAccess={handleRevokeAccess}
              />
            </div>
          )}
        </PageSectionContent>
      </PageSection>

      <AddUserAccessModal
        visible={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false)
          setEditingUser(undefined)
        }}
        onSubmit={handleGrantAccess}
        isSubmitting={isGranting}
        editMode={editingUser}
        usersWithAccess={jitMembers.map((m) => m.user_id)}
      />
    </>
  )
}

export default JitDbAccessConfiguration
