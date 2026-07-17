'use server'

import { auth } from '@/auth'
import { DashboardService } from './services'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function getDashboardStatsAction() {
  try {
    const userId = await requireAuth()
    const stats = await DashboardService.getStats(userId)
    return { success: true, data: stats }
  } catch (error: any) {
    await LoggerService.error('GET_DASHBOARD_STATS_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to fetch dashboard stats' }
  }
}

export async function getDashboardTimelineAction() {
  try {
    const userId = await requireAuth()
    const timeline = await DashboardService.getTimeline(userId)
    return { success: true, data: timeline }
  } catch (error: any) {
    await LoggerService.error('GET_DASHBOARD_TIMELINE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to fetch timeline' }
  }
}
