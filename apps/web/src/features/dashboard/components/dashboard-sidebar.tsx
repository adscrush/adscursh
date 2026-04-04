"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@adscrush/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@adscrush/ui/components/tooltip"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import { UserButton } from "@/components/auth/user-button"

import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Volume2,
  Settings,
  Headphones,
  PanelLeft,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@adscrush/ui/components/avatar"
import { Button } from "@adscrush/ui/components/button"

interface MenuItem {
  title: string
  url?: string
  icon: LucideIcon
  onClick?: () => void
}

interface NavSectionProps {
  label?: string
  items: MenuItem[]
  pathname: string
}

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] text-muted-foreground uppercase">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 border border-transparent px-3 py-2 text-[13px] font-medium tracking-tight data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
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
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false)

  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Voice cloning",
      icon: Volume2,
      onClick: () => setVoiceDialogOpen(true),
    },
  ]

  const othersMenuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: Settings,
      url: "/settings",
    },
    {
      title: "Help and support",
      url: "mailto:business@codewithantonio.com",
      icon: Headphones,
    },
  ]

  return (
    <>
      {/* <VoiceCreateDialog
      open={voiceDialogOpen}
      onOpenChange={setVoiceDialogOpen}
    /> */}
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="h-12 border-b border-dashed border-border pb-2 transition-[padding] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-full items-center justify-between group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:h-0">
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
              size="icon"
              // className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <PanelLeft className="size-4" />
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
                  className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
                >
                  <PanelLeft className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Open sidebar</TooltipContent>
            </Tooltip>
          </div>
        </SidebarHeader>
        <div className="border-b border-dashed border-border" />
        <SidebarContent>
          <NavSection items={mainMenuItems} pathname={pathname} />
          <NavSection
            label="Others"
            items={othersMenuItems}
            pathname={pathname}
          />
        </SidebarContent>
        <div className="border-b border-dashed border-border" />
        <SidebarFooter className="gap-3 py-3">
          {/* <UsageContainer /> */}
          <SidebarMenu>
            <SidebarMenuItem>
              <UserButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  )
}
