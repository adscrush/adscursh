import { Metadata } from "next"
import { DetailedReportsTable } from "@/features/reports/components/detailed-reports-table"
import { SummaryStats } from "@/features/reports/components/summary-stats"
import { ReportsToolbar } from "@/features/reports/components/reports-toolbar"
import { PageHeader } from "@/components/common/page-header"

export const metadata: Metadata = {
  title: "Reports | Adscrush",
  description: "View detailed performance reports and analytics.",
}

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Reports" description="Detailed performance analysis and logs." />
      </div>

      <ReportsToolbar />
      <SummaryStats />
      <DetailedReportsTable />
    </div>
  )
}
