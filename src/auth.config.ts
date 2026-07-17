import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = 
        nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/vehicles') || 
        nextUrl.pathname.startsWith('/maintenance') || 
        nextUrl.pathname.startsWith('/expenses') || 
        nextUrl.pathname.startsWith('/fuel') || 
        nextUrl.pathname.startsWith('/documents')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      } else if (isLoggedIn && nextUrl.pathname.startsWith('/auth')) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
