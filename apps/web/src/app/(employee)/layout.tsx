import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header"
import { SidebarInset, SidebarProvider } from "@adscrush/ui/components/sidebar"
import { cookies } from "next/headers"
import { Suspense } from "react"

async function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-svh"
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  )
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <SidebarStateProvider>
        <DashboardSidebar />
        <SidebarInset className="min-h-0 min-w-0">
          <DashboardHeader />
          <main className="flex min-h-0 flex-1 flex-col p-6">{children}</main>
        </SidebarInset>
      </SidebarStateProvider>
    </Suspense>
  )
}
