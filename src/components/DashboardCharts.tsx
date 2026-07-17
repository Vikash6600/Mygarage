'use client'

import React from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

export function DashboardTrendsChart({ data }: { data: { month: string; amount: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-text-tertiary text-body-sm">
        No expenses logged yet
      </div>
    )
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.4} />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
          labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
          formatter={(value: any) => [formatCurrency(Number(value)), 'Spend']}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="var(--accent)"
          strokeWidth={4}
          dot={{ r: 6, fill: 'var(--surface-0)', stroke: 'var(--accent)', strokeWidth: 3 }}
          activeDot={{ r: 8, fill: 'var(--accent)', stroke: 'var(--surface-0)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
