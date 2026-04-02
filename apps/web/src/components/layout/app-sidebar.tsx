"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconAd2,
  IconUsers,
  IconBuildingStore,
  IconChartBar,
  IconUserCog,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@adscrush/ui/components/sidebar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { title: "Offers", href: "/dashboard/offers", icon: IconAd2 },
  { title: "Affiliates", href: "/dashboard/affiliates", icon: IconUsers },
  { title: "Advertisers", href: "/dashboard/advertisers", icon: IconBuildingStore },
  { title: "Reports", href: "/dashboard/reports", icon: IconChartBar },
  { title: "Employees", href: "/dashboard/employees", icon: IconUserCog },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold">
            AC
          </div>
          <span className="text-lg font-semibold">AdsCrush</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manager Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="text-muted-foreground px-2 py-1 text-xs">
          AdsCrush v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
