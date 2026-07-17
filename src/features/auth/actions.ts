'use server'

import { signIn, signOut } from '@/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from './schema'
import { LoggerService } from '@/services/logger'
import { AuthError } from 'next-auth'
import crypto from 'crypto'

export async function registerUser(formData: any) {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    await LoggerService.warn('REGISTER_VALIDATION_FAILED', parsed.error.format())
    return { success: false, error: 'Validation failed' }
  }

  const { name, email, password } = parsed.data
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      await LoggerService.warn('REGISTER_DUPLICATE_EMAIL', { email })
      return { success: false, error: 'Email already registered' }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'USER' },
    })

    await LoggerService.info('USER_REGISTERED', { userId: user.id, email: user.email })
    return { success: true }
  } catch (error) {
    await LoggerService.error('REGISTER_EXCEPTION', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function loginUser(formData: any) {
  const { email, password } = formData
  try {
    await signIn('credentials', { email, password, redirect: false })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' }
        default:
          return { success: false, error: 'Authentication failed' }
      }
    }
    throw error
  }
}

export async function logoutUser() {
  try {
    await signOut({ redirect: false })
    await LoggerService.info('USER_LOGGED_OUT')
    return { success: true }
  } catch (error) {
    await LoggerService.error('LOGOUT_EXCEPTION', error)
    return { success: false, error: 'Logout failed.' }
  }
}

export async function requestPasswordReset(formData: any) {
  const parsed = forgotPasswordSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: 'Invalid email address' }
  }

  const { email } = parsed.data
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      await LoggerService.warn('PASSWORD_RESET_REQUESTED_NONEXISTENT_USER', { email })
      return { success: true }
    }

    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    })

    await LoggerService.info('PASSWORD_RESET_TOKEN_GENERATED', {
      email,
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`,
    })

    return { success: true }
  } catch (error) {
    await LoggerService.error('PASSWORD_RESET_REQUEST_EXCEPTION', error)
    return { success: false, error: 'An error occurred. Please try again.' }
  }
}

export async function resetPassword(formData: any) {
  const parsed = resetPasswordSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: 'Validation failed' }
  }

  const { token, password } = parsed.data
  try {
    const dbToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!dbToken || dbToken.expires < new Date()) {
      await LoggerService.warn('PASSWORD_RESET_FAILED_INVALID_TOKEN', { token })
      return { success: false, error: 'Invalid or expired reset token' }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { email: dbToken.identifier },
      data: { passwordHash },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    await LoggerService.info('PASSWORD_RESET_SUCCESSFUL', { email: dbToken.identifier })
    return { success: true }
  } catch (error) {
    await LoggerService.error('PASSWORD_RESET_EXCEPTION', error)
    return { success: false, error: 'Failed to reset password. Please try again.' }
  }
}
