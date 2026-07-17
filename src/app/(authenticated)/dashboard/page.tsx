import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardService } from '@/features/dashboard/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Car, Droplet, FileText, AlertTriangle, Landmark, Wrench, LogOut } from 'lucide-react'
import { logoutUser } from '@/features/auth/actions'

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Dashboard Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900 shadow-2xl h-44 flex flex-col justify-end p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <img
            src="/dashboard_banner.png"
            alt="Dashboard banner"
            className="object-cover w-full h-full brightness-50 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 w-full">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Registry Console</h1>
            <p className="text-sm text-slate-300 font-medium">
              Tracking expenditures, servicing milestones, and fuel efficiency.
            </p>
          </div>
          <form
            action={async () => {
              'use server'
              await logoutUser()
              redirect('/auth/login')
            }}
          >
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 px-4 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg shadow-black/40"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Quick Exit</span>
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-white/10 border-t-2 border-t-violet-500 bg-slate-900/40 backdrop-blur-lg hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Vehicles</CardTitle>
            <Car className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeVehiclesCount}</div>
            <p className="text-xs text-slate-500 mt-1">Registered in garage</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 border-t-2 border-t-emerald-500 bg-slate-900/40 backdrop-blur-lg hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Fuel Costs</CardTitle>
            <Droplet className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalFuelCost)}</div>
            <p className="text-xs text-slate-500 mt-1">Spent across {stats.totalFuelLitres.toFixed(1)}L of fuel</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 border-t-2 border-t-amber-500 bg-slate-900/40 backdrop-blur-lg hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Services & Extras</CardTitle>
            <Wrench className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalExpenses)}</div>
            <p className="text-xs text-slate-500 mt-1">Maintenance logs & other category logs</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 border-t-2 border-t-indigo-500 bg-slate-900/40 backdrop-blur-lg hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Cumulative Outlay</CardTitle>
            <Landmark className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalOverallCost)}</div>
            <p className="text-xs text-slate-500 mt-1">Combined vehicles expenditures</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics and Reminders Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Chart Column (Span 4) */}
        <Card className="md:col-span-4 border border-white/10 bg-slate-900/40 backdrop-blur-lg flex flex-col justify-between hover:border-white/15 transition-all duration-300">
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Monthly aggregated cost breakdown (past 6 active months)</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between px-6 pt-4 pb-2 relative">
            {stats.monthlyExpenseTrend.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                No expenses logged yet
              </div>
            ) : (
              (() => {
                const maxAmount = Math.max(...stats.monthlyExpenseTrend.map((t) => t.amount), 1)
                return stats.monthlyExpenseTrend.map((trend, i) => {
                  const heightPercentage = (trend.amount / maxAmount) * 75
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="text-xs font-semibold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        {formatCurrency(trend.amount)}
                      </div>
                      <div
                        className="w-12 bg-gradient-to-t from-violet-600 via-indigo-600 to-indigo-400 rounded-t-lg hover:from-violet-500 hover:via-indigo-500 hover:to-indigo-300 transition-all cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30"
                        style={{ height: `${heightPercentage}%` }}
                      />
                      <div className="text-xs text-slate-400 mt-2 font-medium">{trend.month}</div>
                    </div>
                  )
                })
              })()
            )}
          </CardContent>
        </Card>

        {/* Reminders Column (Span 3) */}
        <Card className="md:col-span-3 border border-white/10 bg-slate-900/40 backdrop-blur-lg flex flex-col hover:border-white/15 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Upcoming Expirations</span>
            </CardTitle>
            <CardDescription>Insurance, PUC, warranty & documents (60-day window)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[250px] space-y-3">
            {stats.upcomingExpiries.length === 0 ? (
              <div className="text-slate-500 text-sm text-center py-8">All clear! No upcoming expirations.</div>
            ) : (
              stats.upcomingExpiries.map((expiry, idx) => {
                let urgencyColor = 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                if (expiry.daysRemaining <= 7) {
                  urgencyColor = 'bg-red-500/10 border-red-500/30 text-red-400'
                } else if (expiry.daysRemaining <= 30) {
                  urgencyColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:border-white/10 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">{expiry.name}</div>
                      <div className="text-xs text-slate-400">
                        {expiry.vehicleName} • Expiry: {new Date(expiry.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.75 rounded-full border ${urgencyColor}`}>
                      {expiry.daysRemaining < 0 ? 'Expired' : `${expiry.daysRemaining} days`}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unified Activity Timeline */}
      <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg hover:border-white/15 transition-all duration-300">
        <CardHeader>
          <CardTitle>Unified Activity Timeline</CardTitle>
          <CardDescription>Chronological events logged across your garage registry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative pl-6 before:absolute before:left-[19px] before:top-2 before:bottom-6 before:w-0.5 before:bg-white/10">
          {timeline.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-6">No activity logs recorded yet.</div>
          ) : (
            timeline.map((item) => {
              let dotColor = 'bg-violet-500'
              let typeIcon = <FileText className="h-3 w-3 text-white" />
              if (item.type === 'FUEL') {
                dotColor = 'bg-emerald-500'
                typeIcon = <Droplet className="h-3 w-3 text-white" />
              } else if (item.type === 'MAINTENANCE') {
                dotColor = 'bg-orange-500'
                typeIcon = <Wrench className="h-3 w-3 text-white" />
              } else if (item.type === 'EXPENSE') {
                dotColor = 'bg-indigo-500'
                typeIcon = <Landmark className="h-3 w-3 text-white" />
              }
              return (
                <div
                  key={item.id}
                  className="relative flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/40 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`absolute -left-[24px] mt-1.5 h-6 w-6 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md ${dotColor}`}
                    >
                      {typeIcon}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-slate-400">
                        {item.vehicleName} {item.subtitle ? `• ${item.subtitle}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end md:space-x-4 pl-9 md:pl-0">
                    <span className="text-xs text-slate-500 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {typeof item.amount === 'number' && (
                      <span className="text-sm font-bold text-white bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-lg">
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
