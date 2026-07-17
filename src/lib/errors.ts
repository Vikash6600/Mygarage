import { NextResponse } from 'next/server'
import { LoggerService } from '@/services/logger'

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500, public code?: string, public details?: any) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code?: string, details?: any) {
    super(message, 400, code, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string, details?: any) {
    super(message, 401, code, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string, details?: any) {
    super(message, 403, code, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource Not Found', code?: string, details?: any) {
    super(message, 404, code, details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string, details?: any) {
    super(message, 409, code, details)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code?: string, details?: any) {
    super(message, 500, code, details)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'APP_ERROR',
          details: error.details || null,
        },
      },
      { status: error.statusCode }
    )
  }

  LoggerService.error('UNHANDLED_EXCEPTION', error)

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR',
        details: null,
      },
    },
    { status: 500 }
  )
}
