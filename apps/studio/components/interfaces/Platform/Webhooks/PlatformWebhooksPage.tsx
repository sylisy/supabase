import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, MoreVertical, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { useParams } from 'common'
import { TextConfirmModal } from 'components/ui/TextConfirmModalWrapper'
import { createNavigationHandler } from 'lib/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  BreadcrumbItem_Shadcn_ as BreadcrumbItem,
  BreadcrumbLink_Shadcn_ as BreadcrumbLink,
  BreadcrumbList_Shadcn_ as BreadcrumbList,
  BreadcrumbPage_Shadcn_ as BreadcrumbPage,
  BreadcrumbSeparator_Shadcn_ as BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox_Shadcn_ as Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form_Shadcn_,
  FormControl_Shadcn_,
  FormField_Shadcn_,
  Input,
  Input_Shadcn_ as InputField,
  Label_Shadcn_ as Label,
  Separator,
  Sheet,
  SheetContent,
  SheetFooter,
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
  TextArea_Shadcn_ as Textarea,
  copyToClipboard,
} from 'ui'
import { EmptyStatePresentational } from 'ui-patterns'
import { FormItemLayout } from 'ui-patterns/form/FormItemLayout/FormItemLayout'
import { PageContainer } from 'ui-patterns/PageContainer'
import {
  PageHeader,
  PageHeaderAside,
  PageHeaderBreadcrumb,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from 'ui-patterns/PageHeader'
import { PageSection, PageSectionContent } from 'ui-patterns/PageSection'
import {
  filterWebhookDeliveries,
  filterWebhookEndpoints,
  usePlatformWebhooksMockStore,
} from './PlatformWebhooks.store'
import { PLATFORM_WEBHOOKS_MOCK_DATA } from './PlatformWebhooks.mock'
import type {
  UpsertWebhookEndpointInput,
  WebhookDeliveryStatus,
  WebhookEndpoint,
  WebhookScope,
} from './PlatformWebhooks.types'

const PANEL_VALUES = ['create', 'edit'] as const

const endpointFormSchema = z
  .object({
    url: z.string().trim().url('Please enter a valid URL'),
    description: z.string().trim().max(512, 'Description cannot exceed 512 characters'),
    enabled: z.boolean().default(true),
    subscribeAll: z.boolean().default(false),
    eventTypes: z.array(z.string()).default([]),
    customHeaders: z
      .array(
        z.object({
          key: z.string().trim(),
          value: z.string().trim(),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.subscribeAll && data.eventTypes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one event type',
        path: ['eventTypes'],
      })
    }
  })

type EndpointFormValues = z.infer<typeof endpointFormSchema>

const statusBadgeVariant: Record<WebhookDeliveryStatus, 'default' | 'success' | 'destructive'> = {
  pending: 'default',
  success: 'success',
  failure: 'destructive',
  skipped: 'default',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )

const toEventTypes = (values: EndpointFormValues) => (values.subscribeAll ? ['*'] : values.eventTypes)

const toEndpointPayload = (values: EndpointFormValues): UpsertWebhookEndpointInput => ({
  name: '',
  url: values.url,
  description: values.description,
  enabled: values.enabled,
  eventTypes: toEventTypes(values),
  customHeaders: values.customHeaders,
})

const formatEvents = (eventTypes: string[]) => (eventTypes.includes('*') ? 'All events (*)' : eventTypes.join(', '))

interface PlatformWebhooksPageProps {
  scope: WebhookScope
}

interface EndpointSheetProps {
  visible: boolean
  mode: 'create' | 'edit'
  endpoint?: WebhookEndpoint
  eventTypes: string[]
  onClose: () => void
  onSubmit: (values: EndpointFormValues) => void
}

const EndpointSheet = ({ visible, mode, endpoint, eventTypes, onClose, onSubmit }: EndpointSheetProps) => {
  const form = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      url: '',
      description: '',
      enabled: true,
      subscribeAll: false,
      eventTypes: [],
      customHeaders: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customHeaders',
  })

  const selectedEventTypes = form.watch('eventTypes')
  const subscribeAll = form.watch('subscribeAll')

  useEffect(() => {
    if (!visible) return

    if (!endpoint) {
      form.reset({
        url: '',
        description: '',
        enabled: true,
        subscribeAll: false,
        eventTypes: [],
        customHeaders: [],
      })
      return
    }

    form.reset({
      url: endpoint.url,
      description: endpoint.description,
      enabled: endpoint.enabled,
      subscribeAll: endpoint.eventTypes.includes('*'),
      eventTypes: endpoint.eventTypes.includes('*') ? [] : endpoint.eventTypes,
      customHeaders: endpoint.customHeaders.map((header) => ({ key: header.key, value: header.value })),
    })
  }, [endpoint, form, visible])

  return (
    <Sheet open={visible} onOpenChange={onClose}>
      <SheetContent size="default" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Create endpoint' : 'Edit endpoint'}</SheetTitle>
        </SheetHeader>
        <Separator />
        <SheetSection className="overflow-auto flex-grow px-0 py-0">
          <Form_Shadcn_ {...form}>
            <form
              id="platform-webhook-endpoint-form"
              className="space-y-5 py-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="px-5 space-y-5">
                <FormField_Shadcn_
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItemLayout label="Endpoint URL" layout="vertical" className="gap-1">
                      <FormControl_Shadcn_>
                        <InputField {...field} placeholder="https://api.example.com/webhooks/supabase" />
                      </FormControl_Shadcn_>
                    </FormItemLayout>
                  )}
                />

                <FormField_Shadcn_
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItemLayout label="Description (optional)" layout="vertical" className="gap-1">
                      <FormControl_Shadcn_>
                        <Textarea {...field} rows={3} />
                      </FormControl_Shadcn_>
                    </FormItemLayout>
                  )}
                />

                {mode === 'edit' && (
                  <FormField_Shadcn_
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItemLayout
                        label="Enable endpoint"
                        description="Disabled endpoints won’t receive deliveries."
                        layout="flex"
                      >
                        <FormControl_Shadcn_>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl_Shadcn_>
                      </FormItemLayout>
                    )}
                  />
                )}
              </div>

              <Separator />

              <div className="px-5 space-y-3">
                <FormField_Shadcn_
                  control={form.control}
                  name="subscribeAll"
                  render={({ field }) => (
                    <FormItemLayout label="Event types" layout="vertical" className="gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                        <Label>Subscribe to all events (*)</Label>
                      </div>
                    </FormItemLayout>
                  )}
                />

                {!subscribeAll && (
                  <FormField_Shadcn_
                    control={form.control}
                    name="eventTypes"
                    render={({ field }) => (
                      <FormItemLayout layout="vertical" className="gap-2">
                        <FormControl_Shadcn_>
                          <div className="space-y-2">
                            {eventTypes.map((eventType) => {
                              const checked = selectedEventTypes.includes(eventType)
                              return (
                                <div key={eventType} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      if (next) {
                                        field.onChange([...new Set([...selectedEventTypes, eventType])])
                                      } else {
                                        field.onChange(selectedEventTypes.filter((value) => value !== eventType))
                                      }
                                    }}
                                  />
                                  <Label>{eventType}</Label>
                                </div>
                              )
                            })}
                          </div>
                        </FormControl_Shadcn_>
                      </FormItemLayout>
                    )}
                  />
                )}
              </div>

              <Separator />

              <div className="px-5 space-y-3">
                <FormItemLayout
                  label="Custom headers (optional)"
                  description="Headers sent with each delivery."
                  layout="vertical"
                  className="gap-3"
                >
                  {fields.length === 0 && <p className="text-sm text-foreground-light">No custom headers.</p>}

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <FormField_Shadcn_
                        control={form.control}
                        name={`customHeaders.${index}.key`}
                        render={({ field }) => (
                          <FormControl_Shadcn_>
                            <InputField {...field} placeholder="Header name" />
                          </FormControl_Shadcn_>
                        )}
                      />
                      <FormField_Shadcn_
                        control={form.control}
                        name={`customHeaders.${index}.value`}
                        render={({ field }) => (
                          <FormControl_Shadcn_>
                            <InputField {...field} placeholder="Header value" />
                          </FormControl_Shadcn_>
                        )}
                      />
                      <Button type="text" onClick={() => remove(index)} icon={<Trash2 size={14} />} />
                    </div>
                  ))}

                  <Button type="default" onClick={() => append({ key: '', value: '' })}>
                    Add header
                  </Button>
                </FormItemLayout>
              </div>
            </form>
          </Form_Shadcn_>
        </SheetSection>
        <SheetFooter>
          <Button type="default" onClick={onClose}>
            Cancel
          </Button>
          <Button form="platform-webhook-endpoint-form" htmlType="submit">
            {mode === 'create' ? 'Create endpoint' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const PlatformWebhooksPage = ({ scope }: PlatformWebhooksPageProps) => {
  const router = useRouter()
  const { slug, ref } = useParams()
  const { endpoints, deliveries, createEndpoint, updateEndpoint, deleteEndpoint, toggleEndpoint, regenerateSecret } =
    usePlatformWebhooksMockStore(scope)
  const [endpointId, setEndpointId] = useQueryState('endpointId', parseAsString)
  const [panel, setPanel] = useQueryState('panel', parseAsStringLiteral(PANEL_VALUES))
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ history: 'replace', clearOnDefault: true })
  )
  const [deliverySearch, setDeliverySearch] = useQueryState(
    'deliverySearch',
    parseAsString.withDefault('').withOptions({ history: 'replace', clearOnDefault: true })
  )

  const [endpointIdPendingDelete, setEndpointIdPendingDelete] = useState<string | null>(null)
  const [showRegenerateSecretConfirm, setShowRegenerateSecretConfirm] = useState(false)

  const scopeLabel = scope === 'organization' ? 'Platform Webhooks' : 'Project Webhooks'
  const scopeDescription =
    scope === 'organization'
      ? 'Manage organization-level webhook endpoints and deliveries'
      : 'Manage webhook endpoints scoped to this project'

  const eventTypeOptions = PLATFORM_WEBHOOKS_MOCK_DATA[scope].eventTypes
  const webhooksHref =
    scope === 'organization' ? `/org/${slug}/webhooks` : `/project/${ref}/settings/webhooks`

  const selectedEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.id === endpointId) ?? null,
    [endpoints, endpointId]
  )

  const endpointPendingDelete = useMemo(
    () => endpoints.find((endpoint) => endpoint.id === endpointIdPendingDelete) ?? null,
    [endpoints, endpointIdPendingDelete]
  )

  useEffect(() => {
    if (!!endpointId && !selectedEndpoint) {
      toast('Endpoint not found')
      setEndpointId(null)
    }
  }, [endpointId, selectedEndpoint, setEndpointId])

  const filteredEndpoints = useMemo(() => {
    return filterWebhookEndpoints(endpoints, search)
  }, [endpoints, search])

  const filteredDeliveries = useMemo(() => {
    if (!selectedEndpoint) return []
    return filterWebhookDeliveries(deliveries, selectedEndpoint.id, deliverySearch)
  }, [deliveries, deliverySearch, selectedEndpoint])

  const handleDeleteEndpoint = () => {
    if (!endpointPendingDelete) return
    deleteEndpoint(endpointPendingDelete.id)
    if (endpointPendingDelete.id === endpointId) {
      setEndpointId(null)
      setDeliverySearch('')
    }
    setEndpointIdPendingDelete(null)
    toast.success(`Deleted endpoint "${endpointPendingDelete.url}"`)
  }

  const handleUpsertEndpoint = (values: EndpointFormValues) => {
    if (panel === 'create') {
      const createdEndpointId = createEndpoint(toEndpointPayload(values))
      setEndpointId(createdEndpointId)
      setPanel(null)
      toast.success('Endpoint created')
      return
    }

    if (panel === 'edit' && selectedEndpoint) {
      updateEndpoint(selectedEndpoint.id, toEndpointPayload(values))
      setPanel(null)
      toast.success('Endpoint updated')
    }
  }

  const handleRegenerateSecret = () => {
    if (!selectedEndpoint) return
    regenerateSecret(selectedEndpoint.id)
    setShowRegenerateSecretConfirm(false)
    toast.success('Signing secret regenerated')
  }

  const isEndpointSheetOpen = panel === 'create' || (panel === 'edit' && !!selectedEndpoint)

  return (
    <>
      <PageHeader size="full" className="pb-6">
        {selectedEndpoint && (
          <PageHeaderBreadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={webhooksHref}>Webhooks</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Endpoint details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </PageHeaderBreadcrumb>
        )}
        <PageHeaderMeta>
          <PageHeaderSummary>
            <PageHeaderTitle>{scopeLabel}</PageHeaderTitle>
            <PageHeaderDescription>{scopeDescription}</PageHeaderDescription>
          </PageHeaderSummary>
          <PageHeaderAside>
            {!selectedEndpoint ? (
              <Button type="primary" icon={<Plus />} onClick={() => setPanel('create')}>
                New endpoint
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button type="default" onClick={() => setPanel('edit')}>
                  Edit
                </Button>
                <Button type="default" onClick={() => toggleEndpoint(selectedEndpoint.id)}>
                  {selectedEndpoint.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            )}
          </PageHeaderAside>
        </PageHeaderMeta>
      </PageHeader>

      <PageContainer size="full">
        <PageSection>
          <PageSectionContent>
            {!selectedEndpoint ? (
              <div className="space-y-4">
                <Input
                  placeholder="Search endpoints"
                  size="tiny"
                  icon={<Search />}
                  value={search}
                  className="w-full lg:w-80"
                  onChange={(event) => setSearch(event.target.value)}
                />

                {filteredEndpoints.length === 0 ? (
                  <EmptyStatePresentational
                    title="No endpoints yet"
                    description="Create an endpoint to start receiving webhook deliveries."
                  >
                    <Button type="default" onClick={() => setPanel('create')}>
                      Create endpoint
                    </Button>
                  </EmptyStatePresentational>
                ) : (
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead className="hidden xl:table-cell">Event types</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Created</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEndpoints.map((endpoint) => (
                          <TableRow
                            key={endpoint.id}
                            className="relative cursor-pointer inset-focus"
                            onClick={createNavigationHandler(
                              `${webhooksHref}?endpointId=${encodeURIComponent(endpoint.id)}`,
                              router
                            )}
                            onAuxClick={createNavigationHandler(
                              `${webhooksHref}?endpointId=${encodeURIComponent(endpoint.id)}`,
                              router
                            )}
                            onKeyDown={createNavigationHandler(
                              `${webhooksHref}?endpointId=${encodeURIComponent(endpoint.id)}`,
                              router
                            )}
                            tabIndex={0}
                          >
                            <TableCell className="truncate max-w-[420px]">{endpoint.url}</TableCell>
                            <TableCell className="hidden xl:table-cell truncate max-w-[280px]">
                              {formatEvents(endpoint.eventTypes)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={endpoint.enabled ? 'success' : 'default'}>
                                {endpoint.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{formatDate(endpoint.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div
                                className="flex justify-end items-center h-full gap-3"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button type="default" icon={<MoreVertical />} className="w-7" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="left">
                                    <DropdownMenuItem
                                      className="gap-x-2"
                                      onClick={() => {
                                        setEndpointId(endpoint.id)
                                        setPanel('edit')
                                      }}
                                    >
                                      <Pencil size={14} />
                                      <span>Edit endpoint</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-x-2"
                                      onClick={() => toggleEndpoint(endpoint.id)}
                                    >
                                      <Power size={14} />
                                      <span>
                                        {endpoint.enabled ? 'Disable endpoint' : 'Enable endpoint'}
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-x-2"
                                      onClick={() => setEndpointIdPendingDelete(endpoint.id)}
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete endpoint</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <ChevronRight aria-hidden={true} size={14} className="text-foreground-muted/60" />
                                <button tabIndex={-1} className="sr-only">
                                  Go to endpoint details
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-end gap-2">
                  <Button type="default" onClick={() => copyToClipboard(selectedEndpoint.url)}>
                    Copy URL
                  </Button>
                  <Button type="danger" onClick={() => setEndpointIdPendingDelete(selectedEndpoint.id)}>
                    Delete
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground text-2xl">Endpoint</h3>
                    <Badge variant={selectedEndpoint.enabled ? 'success' : 'default'}>
                      {selectedEndpoint.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground-light">{selectedEndpoint.url}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableHead className="w-44">URL</TableHead>
                          <TableCell>{selectedEndpoint.url}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableCell>{selectedEndpoint.description || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead>Event types</TableHead>
                          <TableCell>{formatEvents(selectedEndpoint.eventTypes)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead>Custom headers</TableHead>
                          <TableCell>
                            {selectedEndpoint.customHeaders.length === 0
                              ? '-'
                              : selectedEndpoint.customHeaders.map((header) => (
                                <div key={header.id}>
                                  <code className="text-code-inline">{header.key}</code>: {header.value}
                                </div>
                              ))}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead>Created by</TableHead>
                          <TableCell>{selectedEndpoint.createdBy}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead>Created at</TableHead>
                          <TableCell>{formatDate(selectedEndpoint.createdAt)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Signing secret</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableHead className="w-44">Secret</TableHead>
                            <TableCell>{selectedEndpoint.signingSecret}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="flex items-center gap-2">
                        <Button type="default" onClick={() => copyToClipboard(selectedEndpoint.signingSecret)}>
                          Copy secret
                        </Button>
                        <Button type="warning" onClick={() => setShowRegenerateSecretConfirm(true)}>
                          Regenerate secret
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-foreground">Deliveries</h4>
                    <p className="text-sm text-foreground-light">{filteredDeliveries.length} total</p>
                  </div>
                  <Input
                    placeholder="Search deliveries"
                    size="tiny"
                    icon={<Search />}
                    value={deliverySearch}
                    className="w-full lg:w-80"
                    onChange={(event) => setDeliverySearch(event.target.value)}
                  />
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Event type</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Attempt at</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDeliveries.length > 0 ? (
                          filteredDeliveries.map((delivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell>
                                <Badge variant={statusBadgeVariant[delivery.status]}>{delivery.status}</Badge>
                              </TableCell>
                              <TableCell>{delivery.eventType}</TableCell>
                              <TableCell>{delivery.responseCode ?? '-'}</TableCell>
                              <TableCell>{formatDate(delivery.attemptAt)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>No deliveries found.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>
            )}
          </PageSectionContent>
        </PageSection>
      </PageContainer>

      <EndpointSheet
        visible={isEndpointSheetOpen}
        mode={panel === 'create' ? 'create' : 'edit'}
        endpoint={panel === 'edit' ? selectedEndpoint ?? undefined : undefined}
        eventTypes={eventTypeOptions}
        onClose={() => setPanel(null)}
        onSubmit={handleUpsertEndpoint}
      />

      <TextConfirmModal
        variant="destructive"
        visible={!!endpointPendingDelete}
        size="small"
        title="Delete endpoint"
        onCancel={() => setEndpointIdPendingDelete(null)}
        onConfirm={handleDeleteEndpoint}
        confirmLabel="Delete endpoint"
        confirmPlaceholder="Type in endpoint URL"
        confirmString={endpointPendingDelete?.url ?? ''}
        text={
          endpointPendingDelete ? (
            <>
              This will delete endpoint{' '}
              <span className="text-bold text-foreground">{endpointPendingDelete.url}</span>.
            </>
          ) : undefined
        }
        alert={{ title: 'You cannot recover this endpoint once deleted.' }}
      />

      <AlertDialog open={showRegenerateSecretConfirm} onOpenChange={setShowRegenerateSecretConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate signing secret</AlertDialogTitle>
            <AlertDialogDescription>
              This will rotate the current signing secret used for webhook signature verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="warning" onClick={handleRegenerateSecret}>
              Regenerate secret
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
