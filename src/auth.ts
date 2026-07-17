import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { authConfig } from '@/auth.config'
import { loginSchema } from '@/features/auth/schema'
import { LoggerService } from '@/services/logger'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          await LoggerService.warn('AUTH_VALIDATION_FAILED', {
            errors: parsedCredentials.error.format(),
          })
          return null
        }

        const { email, password } = parsedCredentials.data

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            await LoggerService.warn('AUTH_USER_NOT_FOUND', { email })
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (!passwordsMatch) {
            await LoggerService.warn('AUTH_INVALID_PASSWORD', { email })
            return null
          }

          await LoggerService.info('AUTH_LOGIN_SUCCESSFUL', {
            userId: user.id,
            email: user.email,
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          await LoggerService.error('AUTH_AUTHORIZE_EXCEPTION', error)
          return null
        }
      },
    }),
  ],
})
