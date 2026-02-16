import { Boxes, Check, ChevronsUpDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { useParams } from 'common'
import PartnerIcon from 'components/ui/PartnerIcon'
import { useOrganizationsQuery } from 'data/organizations/organizations-query'
import { useIsFeatureEnabled } from 'hooks/misc/useIsFeatureEnabled'
import { useSelectedOrganizationQuery } from 'hooks/misc/useSelectedOrganization'
import {
  CommandEmpty_Shadcn_,
  CommandGroup_Shadcn_,
  CommandInput_Shadcn_,
  CommandItem_Shadcn_,
  CommandList_Shadcn_,
  CommandSeparator_Shadcn_,
  Command_Shadcn_,
  PopoverContent_Shadcn_,
  PopoverTrigger_Shadcn_,
  Popover_Shadcn_,
  ScrollArea,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  cn,
} from 'ui'
import { ShimmeringLoader } from 'ui-patterns/ShimmeringLoader'

export function OrgSelector() {
  const router = useRouter()
  const { slug: routeSlug } = useParams()
  const { data: selectedOrganization } = useSelectedOrganizationQuery()
  const { data: organizations, isPending: isLoadingOrganizations } = useOrganizationsQuery()
  const organizationCreationEnabled = useIsFeatureEnabled('organizations:create')

  const [open, setOpen] = useState(false)

  const slug = selectedOrganization?.slug

  if (isLoadingOrganizations) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-2">
            <ShimmeringLoader className="w-full py-2" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover_Shadcn_ open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger_Shadcn_ asChild>
            <SidebarMenuButton
              className={cn(
                'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                'h-8'
              )}
            >
              <Boxes size={14} strokeWidth={1.5} className="text-foreground-lighter" />
              <span className="truncate text-xs text-foreground-light">
                {selectedOrganization?.name ?? 'Select organization'}
              </span>
              <ChevronsUpDown className="ml-auto size-3.5 text-foreground-lighter" />
            </SidebarMenuButton>
          </PopoverTrigger_Shadcn_>
          <PopoverContent_Shadcn_ className="p-0" side="bottom" align="start">
            <Command_Shadcn_>
              <CommandInput_Shadcn_ placeholder="Find organization..." />
              <CommandList_Shadcn_>
                <CommandEmpty_Shadcn_>No organizations found</CommandEmpty_Shadcn_>
                <CommandGroup_Shadcn_>
                  <ScrollArea className={(organizations || []).length > 7 ? 'h-[210px]' : ''}>
                    {organizations?.map((org) => {
                      const href = routeSlug
                        ? router.pathname.replace('[slug]', org.slug)
                        : `/org/${org.slug}`

                      return (
                        <CommandItem_Shadcn_
                          key={org.slug}
                          value={`${org.name.replaceAll('"', '')} - ${org.slug}`}
                          className="cursor-pointer w-full"
                          onSelect={() => {
                            setOpen(false)
                            router.push(href)
                          }}
                          onClick={() => setOpen(false)}
                        >
                          <Link href={href} className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{org.name}</span>
                              <PartnerIcon organization={org} />
                            </div>
                            {org.slug === slug && <Check size={16} />}
                          </Link>
                        </CommandItem_Shadcn_>
                      )
                    })}
                  </ScrollArea>
                </CommandGroup_Shadcn_>
                <CommandSeparator_Shadcn_ />
                <CommandGroup_Shadcn_>
                  <CommandItem_Shadcn_
                    className="cursor-pointer w-full"
                    onSelect={() => {
                      setOpen(false)
                      router.push('/organizations')
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/organizations" className="flex items-center gap-2 w-full">
                      <p>All Organizations</p>
                    </Link>
                  </CommandItem_Shadcn_>
                </CommandGroup_Shadcn_>
                {organizationCreationEnabled && (
                  <>
                    <CommandSeparator_Shadcn_ />
                    <CommandGroup_Shadcn_>
                      <CommandItem_Shadcn_
                        className="cursor-pointer w-full"
                        onSelect={() => {
                          setOpen(false)
                          router.push('/new')
                        }}
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/new" className="flex items-center gap-2 w-full">
                          <Plus size={14} strokeWidth={1.5} />
                          <p>New organization</p>
                        </Link>
                      </CommandItem_Shadcn_>
                    </CommandGroup_Shadcn_>
                  </>
                )}
              </CommandList_Shadcn_>
            </Command_Shadcn_>
          </PopoverContent_Shadcn_>
        </Popover_Shadcn_>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
