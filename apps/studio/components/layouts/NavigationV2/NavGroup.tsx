import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { isValidElement, ReactNode } from 'react'
import {
  Collapsible_Shadcn_ as Collapsible,
  CollapsibleContent_Shadcn_ as CollapsibleContent,
  CollapsibleTrigger_Shadcn_ as CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from 'ui'

export interface NavGroupItem {
  title: string
  url: string
  icon?: LucideIcon | ReactNode
  isActive?: boolean
  label?: string
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

export interface NavGroupProps {
  label?: string
  items: NavGroupItem[]
}

export function NavGroup({ label, items }: NavGroupProps) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel className="text-foreground-lighter">{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    className="gap-3 text-foreground-light"
                  >
                    <NavItemIcon icon={item.icon} />
                    <span>{item.title}</span>
                    {item.label && (
                      <span className="ml-1 rounded bg-foreground-muted/20 px-1.5 py-0.5 text-[10px] leading-none font-medium">
                        {item.label}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      strokeWidth={1.5}
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-foreground-lighter hidden !w-4 !h-4 group-hover:block"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                asChild
                className="gap-3 text-foreground-light"
              >
                <Link href={item.url}>
                  <NavItemIcon icon={item.icon} />
                  <span>{item.title}</span>
                  {item.label && (
                    <span className="ml-1 rounded bg-foreground-muted/20 px-1.5 py-0.5 text-[10px] leading-none font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavItemIcon({ icon }: { icon?: LucideIcon | ReactNode }) {
  if (!icon) return null

  // If it's already a rendered React element (e.g. <SomeIcon />), use it as-is
  if (isValidElement(icon)) {
    return icon
  }

  // Otherwise it's a component reference (function or forwardRef) - render it
  const IconComponent = icon as LucideIcon
  return <IconComponent size={14} strokeWidth={1.5} />
}
