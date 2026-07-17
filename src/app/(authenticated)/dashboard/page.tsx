import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardService } from '@/features/dashboard/services'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Car,
  Droplet,
  FileText,
  AlertTriangle,
  Landmark,
  Wrench,
  TrendingUp,
} from 'lucide-react'
import { DashboardTrendsChart } from '@/components/DashboardCharts'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userId = session.user.id
  const [stats, timeline] = await Promise.all([
    DashboardService.getStats(userId),
    DashboardService.getTimeline(userId),
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalOverallCost = stats.totalExpenses + stats.totalFuelCost

  // Time-aware greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-h1 text-text-primary">{greeting}</h1>
        <p className="text-body text-text-secondary">
          Here&apos;s an overview of your garage activity and expenses.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Vehicles"
          value={stats.activeVehiclesCount}
          icon={<Car className="size-4" />}
          description="In your garage"
        />
        <StatCard
          label="Total Fuel"
          value={formatCurrency(stats.totalFuelCost)}
          icon={<Droplet className="size-4" />}
          description={`${stats.totalFuelLitres.toFixed(1)}L • ${(stats as any).avgMileage ? (stats as any).avgMileage.toFixed(1) + ' km/l' : 'N/A'}`}
        />
        <StatCard
          label="Services & Extras"
          value={formatCurrency(stats.totalExpenses)}
          icon={<Wrench className="size-4" />}
          description="Maintenance + expenses"
        />
        <StatCard
          label="Total Spend"
          value={formatCurrency(totalOverallCost)}
          icon={<Landmark className="size-4" />}
          description="Combined outlay"
        />
      </div>

      {/* Charts + Reminders Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Spending Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Monthly aggregated cost breakdown</CardDescription>
              </div>
              <TrendingUp className="size-4 text-text-tertiary" />
            </div>
          </CardHeader>
          <CardContent className="h-56 relative pt-4">
            <DashboardTrendsChart data={stats.monthlyExpenseTrend} />
          </CardContent>
        </Card>

        {/* Upcoming Expirations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <div>
                <CardTitle>Upcoming Expirations</CardTitle>
                <CardDescription>Insurance, PUC, warranty &amp; docs (60 days)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[200px] overflow-y-auto space-y-2">
            {stats.upcomingExpiries.length === 0 ? (
              <div className="text-text-tertiary text-body-sm text-center py-8">
                All clear! No upcoming expirations.
              </div>
            ) : (
              stats.upcomingExpiries.map((expiry, idx) => {
                let badgeVariant: 'success' | 'warning' | 'danger' = 'success'
                if (expiry.daysRemaining <= 7) badgeVariant = 'danger'
                else if (expiry.daysRemaining <= 30) badgeVariant = 'warning'

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-2/40 hover:bg-surface-2 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-body-sm font-semibold text-text-primary truncate">{expiry.name}</div>
                      <div className="text-caption text-text-tertiary">
                        {expiry.vehicleName} · {new Date(expiry.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={badgeVariant} size="sm" className="flex-shrink-0">
                      {expiry.daysRemaining < 0 ? 'Expired' : `${expiry.daysRemaining}d`}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent events across your garage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.length === 0 ? (
            <div className="text-text-tertiary text-body-sm text-center py-8">
              No activity recorded yet.
            </div>
          ) : (
            timeline.slice(0, 10).map((item) => {
              let dotColor = 'bg-accent'
              let TypeIcon = FileText
              if (item.type === 'FUEL') {
                dotColor = 'bg-success'
                TypeIcon = Droplet
              } else if (item.type === 'MAINTENANCE') {
                dotColor = 'bg-warning'
                TypeIcon = Wrench
              } else if (item.type === 'EXPENSE') {
                dotColor = 'bg-info'
                TypeIcon = Landmark
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-2/30 hover:bg-surface-2/60 transition-colors"
                >
                  <div className={`size-8 rounded-[var(--radius-sm)] ${dotColor}/15 flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className={`size-3.5 ${dotColor === 'bg-accent' ? 'text-accent' : dotColor === 'bg-success' ? 'text-success' : dotColor === 'bg-warning' ? 'text-warning' : 'text-info'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm font-semibold text-text-primary truncate">{item.title}</div>
                    <div className="text-caption text-text-tertiary">
                      {item.vehicleName} {item.subtitle ? `· ${item.subtitle}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-caption text-text-tertiary flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {typeof item.amount === 'number' && (
                      <span className="text-body-sm font-bold text-text-primary bg-surface-2 border border-border-subtle px-2 py-0.5 rounded-[var(--radius-sm)]">
                        {formatCurrency(item.amount)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
