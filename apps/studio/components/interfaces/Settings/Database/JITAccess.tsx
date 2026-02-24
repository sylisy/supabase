import { EllipsisVertical, Eye, Trash2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useParams } from 'common'
import { DocsButton } from 'components/ui/DocsButton'
import { DOCS_URL } from 'lib/constants'
import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSection,
  SheetTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { InlineLink } from 'components/ui/InlineLink'
import { Admonition } from 'ui-patterns/admonition'
import { FormLayout } from 'ui-patterns/form/Layout/FormLayout'

// Prototype: mock user type and initial list
type JITUser = { id: string; email: string; name?: string; roles: number; status: string }
const MOCK_USERS: JITUser[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice', roles: 2, status: '1 active, 1 expired' },
  { id: '2', email: 'bob@example.com', roles: 1, status: 'Expired' },
]
// Prototype: mock Postgres version
const isPostgresVersionOutdated = false

const JIT_STATUS_VARIANT: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  expired: 'warning',
  active: 'default',
}
function getJitStatusVariant(status: string): React.ComponentProps<typeof Badge>['variant'] {
  const normalized = status.toLowerCase()
  if (normalized.includes('expired')) return JIT_STATUS_VARIANT.expired
  if (normalized.includes('active')) return JIT_STATUS_VARIANT.active
  return 'default'
}


export const JITAccess = () => {
  const { ref: projectRef } = useParams()
  const [enabled, setEnabled] = useState(false)
  const [selectedUser, setSelectedUser] = useState<JITUser | null>(null)
  // const [users, setUsers] = useState<JITUser[]>([])
  const [users, setUsers] = useState<JITUser[]>(MOCK_USERS)

  return (
    <PageSection id="jit-access">
      <PageSectionMeta>
        <PageSectionSummary>
          <PageSectionTitle>Just-in-Time (JIT)</PageSectionTitle>
        </PageSectionSummary>
        <DocsButton href={`${DOCS_URL}/guides/platform/jit-access`} />
      </PageSectionMeta>
      <PageSectionContent>
        <Card>
          <CardContent className="space-y-4">
            <FormLayout
              layout="flex-row-reverse"
              label="JIT access"
              description="Allow time-limited database access to specific project members."
            >
              {/* Swich and tooltip */}
              <div className="flex items-center justify-end w-fit flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        size="large"
                        checked={enabled}
                        onCheckedChange={(checked) => setEnabled(checked)}
                        disabled={isPostgresVersionOutdated}
                      />
                    </div>
                  </TooltipTrigger>
                  {isPostgresVersionOutdated && (
                    <TooltipContent side="bottom">
                      Upgrade Postgres to use JIT
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </FormLayout>
          </CardContent>

          {!enabled && !users?.length && isPostgresVersionOutdated && (
            <Admonition
              type="note"
              layout="horizontal"
              title="Postgres upgrade required"
              description="Just-in-time access requires a newer Postgres version. Upgrade your project to enable JIT."
              className="mb-0 rounded-none border-0"
              actions={
                projectRef ? (
                  <Button type="default" asChild>
                    <Link href={`/project/${projectRef}/settings/infrastructure`}>
                      Upgrade Postgres
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          )}

          {enabled && (
            <CardContent className="space-y-4 p-0">
              <div className="flex items-center justify-between pt-6 pb-2 px-4">
                <div>
                  <h3 className="text-foreground text-sm">User rules</h3>
                  <p className="text-foreground-light text-sm">
                    Define which members can receive temporary database access.
                  </p>
                </div>
                <Button type="default" icon={<UserPlus size={14} />}>
                  Add user
                </Button>
              </div>
              <Table className="border-t">
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-1">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty state */}
                  {users.length === 0 ? (
                    <TableRow className="[&>td]:hover:bg-inherit">
                      <TableCell colSpan={3}>
                        <p className="text-sm text-foreground">No users yet</p>
                        <p className="text-sm text-foreground-lighter">
                          Add a user above to allow JIT access.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="relative cursor-pointer inset-focus"
                        onClick={(event) => {
                          if ((event.target as HTMLElement).closest('button')) return
                          setSelectedUser(user)
                        }}
                        onKeyDown={(event) => {
                          if ((event.target as HTMLElement).closest('button')) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setSelectedUser(user)
                          }
                        }}
                        tabIndex={0}
                      >
                        <TableCell className="text-sm">
                          {user.name && <p> {user.name} </p>}
                          <p className="text-foreground-lighter">
                            {user.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-foreground-light text-sm">
                          {user.roles} role{user.roles > 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-foreground-light text-sm">
                          <Badge variant={getJitStatusVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                icon={<EllipsisVertical />}
                                aria-label="More actions"
                                type="default"
                                size="tiny"
                                className="w-7"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="bottom" className="w-40">

                              <DropdownMenuItem
                                className="gap-x-2"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye size={14} className="text-foreground-lighter" />
                                Inspect
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-x-2" onClick={() => { }}>
                                <Trash2 size={14} className="text-foreground-lighter" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

            </CardContent>
          )}
        </Card>

        <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <SheetContent className="flex flex-col gap-0">
            <SheetHeader>
              <SheetTitle>
                {selectedUser?.name ?? selectedUser?.email ?? 'User details'}
              </SheetTitle>
              <SheetDescription>
                View JIT access details for this user.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-auto flex-grow px-0">
              <SheetSection>
                <div className="grid gap-4 py-4">
                  {selectedUser && (
                    <>
                      {selectedUser.name && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm text-foreground-light">Name</span>
                          <span className="col-span-3 text-sm">{selectedUser.name}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-foreground-light">Email</span>
                        <span className="col-span-3 text-sm">{selectedUser.email}</span>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-foreground-light">Roles</span>
                        <span className="col-span-3 text-sm">
                          {selectedUser.roles} role{selectedUser.roles > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-foreground-light">Status</span>
                        <span className="col-span-3">
                          <Badge variant={getJitStatusVariant(selectedUser.status)}>
                            {selectedUser.status}
                          </Badge>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </SheetSection>
            </div>
          </SheetContent>
        </Sheet>
      </PageSectionContent>
    </PageSection >
  )
}
