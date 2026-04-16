"use client"

import { usePathname } from "next/navigation"

import { UserButton } from "@/components/auth/user-button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@adscrush/ui/components/avatar"
import { Button } from "@adscrush/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adscrush/ui/components/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@adscrush/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@adscrush/ui/components/tooltip"

import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Box,
  Building,
  ChevronRight,
  CircleUser,
  Home,
  LifeBuoy,
  PanelLeft,
  Settings,
  ShieldAlert,
  Tag,
  UserCog,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface MenuItem {
  title: string
  url?: string
  icon: LucideIcon
  items?: {
    title: string
    url: string
    onClick?: () => void
  }[]
  onClick?: () => void
}

interface NavSectionProps {
  items: MenuItem[]
  pathname: string
}

function NavSection({ items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasChildren = item.items && item.items.length > 0
            const isActive = item.url
              ? item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url)
              : false

            if (!hasChildren) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!!item.url}
                    isActive={isActive}
                    onClick={item.onClick}
                    tooltip={item.title}
                    className="h-9 px-3 py-2 text-[13px] font-medium tracking-tight data-[active=true]:bg-primary/10 data-[active=true]:text-primary dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground"
                  >
                    {item.url ? (
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        <item.icon />
                        <span>{item.title}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.items?.some((sub) => pathname === sub.url)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="h-9 border border-transparent px-3 py-2 text-[13px] font-medium tracking-tight"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild={!subItem.onClick}
                            isActive={pathname === subItem.url}
                            onClick={subItem.onClick}
                          >
                            {subItem.onClick ? (
                              <div className="flex w-full items-center">
                                <span>{subItem.title}</span>
                              </div>
                            ) : (
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()

  const mainNavItems: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    {
      title: "Offers",
      icon: Tag,
      items: [
        { title: "All Offers", url: "/offers" },
        { title: "Create Offer", url: "/offers/new" },
        { title: "Smart Offers", url: "/offers/smart" },
      ],
    },
    {
      title: "Reports / Logs",
      icon: BarChart3,
      items: [
        { title: "Reports", url: "/reports" },
        { title: "Reports KPI", url: "/reports/kpi" },
        { title: "Conversion Logs", url: "/reports/conversions" },
        { title: "Postback Logs", url: "/reports/postbacks" },
      ],
    },
    {
      title: "Affiliates",
      icon: Users,
      url: "/affiliates",
    },
    {
      title: "Advertisers",
      icon: Building,
      url: "/advertisers",
    },
    {
      title: "Employees",
      icon: UserCog,
      items: [{ title: "All Employees", url: "/employees" }],
    },
  ]

  const serviceNavItems: MenuItem[] = [
    {
      title: "Fraud Detection",
      icon: ShieldAlert,
      items: [
        { title: "Logs", url: "/fraud/logs" },
        { title: "Settings", url: "/fraud/settings" },
      ],
    },
    {
      title: "Integration",
      icon: Zap,
      items: [
        { title: "Tracking", url: "/integration/tracking" },
        { title: "API", url: "/integration/api" },
      ],
    },
    {
      title: "Tools",
      icon: Box,
      items: [
        { title: "Bulk Upload", url: "/tools/upload" },
        { title: "Link Checker", url: "/tools/checker" },
      ],
    },
  ]

  const bottomNavItems: MenuItem[] = [
    {
      title: "Account",
      icon: CircleUser,
      items: [
        { title: "Settings", url: "/settings" },
        { title: "Profile", url: "/profile" },
        { title: "Security", url: "/security" },
        { title: "Access logs", url: "/account/access-logs" },
      ],
    },
    { title: "Support", icon: LifeBuoy, url: "/support" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ]

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="flex h-12 flex-row items-center gap-0 border-b border-dashed border-border p-0! px-4 transition-[padding] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
        <div className="flex grow items-center justify-between pr-2 pl-4 group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:size-0 group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pl-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarImage
                src={"/logo.png"}
                alt="AdsCrush"
                className="rounded-md"
              />
              <AvatarFallback className="rounded-md">AC</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Adscrush
            </span>
          </div>
          <Button
            onClick={() => setOpen(!open)}
            variant="ghost"
            size="icon-sm"
            className="size-8"
          >
            <PanelLeft className="size-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        <div className="hidden group-data-[collapsible=icon]:relative group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-6 w-6 rounded-md group-hover:invisible">
            <AvatarImage
              src={"/logo.png"}
              alt="AdsCrush"
              className="rounded-md"
            />
            <AvatarFallback className="rounded-md">AC</AvatarFallback>
          </Avatar>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setOpen(!open)}
                className="absolute inset-0 m-auto flex size-9 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
              >
                <PanelLeft className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Open sidebar</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavSection items={mainNavItems} pathname={pathname} />
        <NavSection items={serviceNavItems} pathname={pathname} />
        <div className="mt-auto">
          <NavSection items={bottomNavItems} pathname={pathname} />
        </div>
      </SidebarContent>
      <div className="border-b border-dashed border-border" />
      <SidebarFooter className="gap-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
