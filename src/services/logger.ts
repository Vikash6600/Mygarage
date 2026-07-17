import prisma from '@/lib/prisma'

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'

export class LoggerService {
  private static formatDetails(details?: any): string | null {
    if (!details) return null
    if (details instanceof Error) {
      return JSON.stringify({
        name: details.name,
        message: details.message,
        stack: details.stack,
      })
    }
    if (typeof details === 'object') {
      try {
        return JSON.stringify(details)
      } catch {
        return String(details)
      }
    }
    return String(details)
  }

  private static async log(level: LogLevel, action: string, details?: any, userId?: string, ipAddress?: string) {
    const formattedDetails = this.formatDetails(details)
    const timestamp = new Date().toISOString()
    
    console.log(
      `[${timestamp}] [${level}] [${action}]` + 
      (userId ? ` [User: ${userId}]` : '') + 
      (formattedDetails ? ` - Details: ${formattedDetails}` : '')
    )

    try {
      await prisma.activityLog.create({
        data: {
          level,
          action,
          details: formattedDetails,
          userId: userId || null,
          ipAddress: ipAddress || null,
        },
      })
    } catch (dbError) {
      console.error('Failed to write log to database:', dbError)
    }
  }

  static async info(action: string, details?: any, userId?: string, ipAddress?: string) {
    await this.log('INFO', action, details, userId, ipAddress)
  }

  static async warn(action: string, details?: any, userId?: string, ipAddress?: string) {
    await this.log('WARNING', action, details, userId, ipAddress)
  }

  static async error(action: string, details?: any, userId?: string, ipAddress?: string) {
    await this.log('ERROR', action, details, userId, ipAddress)
  }

  static async debug(action: string, details?: any, userId?: string, ipAddress?: string) {
    await this.log('DEBUG', action, details, userId, ipAddress)
  }
}
