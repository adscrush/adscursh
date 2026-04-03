"use client"

import { Headphones, ThumbsUp } from "lucide-react"
import Link from "next/link"

import { Button } from "@adscrush/ui/components/button"
import { useSession } from "@/lib/auth/client"

export function DashboardHeader() {
  const { data, isPending } = useSession()
  const user = data?.user

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Nice to see you</p>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          {isPending ? (user?.name?.split(" ")[0] ?? "there") : "..."}
        </h1>
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <Button variant="outline" size="sm" asChild>
          <Link href="mailto:business@codewithantonio.com">
            <ThumbsUp />
            <span className="hidden lg:block">Feedback</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="mailto:business@codewithantonio.com">
            <Headphones />
            <span className="hidden lg:block">Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
