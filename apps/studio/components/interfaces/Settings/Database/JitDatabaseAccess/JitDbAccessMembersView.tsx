import { AlertCircle, HelpCircle, Trash2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

import { useParams } from 'common'
import AlertError from 'components/ui/AlertError'
import { useJitDbAccessMembersQuery } from 'data/jit-db-access/jit-db-access-members-query'
import { useProjectMembersQuery } from 'data/projects/project-members-query'
import { useProfile } from 'lib/profile'
import { partition } from 'lodash'
import { useMemo } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Loading,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Card,
  CardContent,
  Badge,
  Skeleton,
} from 'ui'
import { Admonition } from 'ui-patterns'
//import { MemberRow } from './MemberRow'

export interface MembersViewProps {
  onEditUser?: (user: {
    userId: string
    userName: string
    userEmail: string
    currentRoles: Array<{ role: string; expires_at?: Date }>
  }) => void
  onRevokeAccess?: (userId: string, userEmail: string) => void
}

const MembersView = ({ onEditUser, onRevokeAccess }: MembersViewProps) => {
  const { ref } = useParams()
  const { profile } = useProfile()
  const [userToRevoke, setUserToRevoke] = useState<{ userId: string; userEmail: string } | null>(
    null
  )

  const {
    data: members = [],
    error: membersError,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    isSuccess: isSuccessMembers,
  } = useJitDbAccessMembersQuery({ projectRef: ref })

  const {
    data: projectMembers = [],
    error: projectMembersError,
    isLoading: isLoadingProjectMembers,
    isError: isErrorProjectMembers,
    isSuccess: isSuccessProjectMembers,
  } = useProjectMembersQuery({ projectRef: ref })

  const memberMap = new Map(projectMembers.map((m) => [m.user_id, m]))

  const decoratedMembers = members.map((item) => {
    const member = memberMap.get(item.user_id)
    if (member) {
      return {
        ...item,
        primary_email: member.primary_email,
        username: member.username,
      }
    }
    return item // if no match, leave it as is
  })

  return (
    <>
      {isLoadingMembers && (
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {isErrorMembers && (
        <AlertError error={membersError} subject="Failed to retrieve organization members" />
      )}

      {isSuccessMembers && (
        <>
          {decoratedMembers.length === 0 ? (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-foreground-light mb-3" />
                  <p className="text-sm text-foreground-light">No users have JIT database access</p>
                  <p className="text-xs text-foreground-lighter mt-1">
                    Click "Add user" to grant access
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded w-full overflow-hidden">
              <Card>
                <Loading active={!members}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {decoratedMembers.map((member) => (
                        <TableRow key={member.user_id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {member.primary_email || member.user_id}
                              </span>
                              {member.username && (
                                <span className="text-xs text-foreground-lighter">
                                  {member.username}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.user_roles?.map((roleObj, idx) => (
                                <Badge key={idx} variant="outline">
                                  {roleObj.role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {member.user_roles?.map((roleObj, idx) => (
                                <span key={idx} className="text-xs text-foreground-light">
                                  {roleObj.role}:{' '}
                                  {roleObj.expires_at
                                    ? format(new Date(roleObj.expires_at * 1000), 'PPPp')
                                    : 'Never'}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="text"
                                    icon={<Pencil />}
                                    className="px-1"
                                    onClick={() =>
                                      onEditUser?.({
                                        userId: member.user_id,
                                        userName: member.username || '',
                                        userEmail: member.primary_email || member.user_id,
                                        currentRoles:
                                          member.user_roles?.map((r) => ({
                                            role: r.role,
                                            expires_at: r.expires_at
                                              ? new Date(r.expires_at * 1000)
                                              : undefined,
                                          })) || [],
                                      })
                                    }
                                  />
                                </TooltipTrigger>
                                <TooltipContent>Edit access</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="text"
                                    icon={<Trash2 />}
                                    className="px-1"
                                    onClick={() =>
                                      setUserToRevoke({
                                        userId: member.user_id,
                                        userEmail: member.primary_email || member.user_id,
                                      })
                                    }
                                  />
                                </TooltipTrigger>
                                <TooltipContent>Revoke access</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Loading>
              </Card>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!userToRevoke} onOpenChange={() => setUserToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke database access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke database access for{' '}
              <span className="font-medium">{userToRevoke?.userEmail}</span>? This will remove all
              assigned roles and they will no longer be able to connect to the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToRevoke(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToRevoke) {
                  onRevokeAccess?.(userToRevoke.userId, userToRevoke.userEmail)
                  setUserToRevoke(null)
                }
              }}
            >
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MembersView
