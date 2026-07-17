export interface DashboardStats {
  totalExpenses: number
  totalFuelCost: number
  totalFuelLitres: number
  avgMileage: number
  activeVehiclesCount: number
  categoryExpenses: { category: string; value: number }[]
  monthlyExpenseTrend: { month: string; amount: number }[]
  upcomingExpiries: {
    vehicleId: string
    vehicleName: string
    type: string
    name: string
    expiryDate: Date
    daysRemaining: number
  }[]
}

export interface TimelineItem {
  id: string
  vehicleId: string
  vehicleName: string
  date: Date
  type: 'FUEL' | 'MAINTENANCE' | 'EXPENSE' | 'DOCUMENT'
  title: string
  subtitle?: string | null
  amount?: number | null
}
