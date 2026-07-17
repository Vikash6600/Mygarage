import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Shield, Bell } from 'lucide-react'
import { logoutUser } from '@/features/auth/actions'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-h1 text-text-primary">Settings</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-text-tertiary" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={session.user.name || session.user.email || 'User'} size="lg" />
            <div>
              <div className="text-h3 text-text-primary">{session.user.name || 'User'}</div>
              <div className="text-body-sm text-text-secondary">{session.user.email}</div>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-body-sm text-text-secondary">Name</span>
              <span className="text-body-sm font-medium text-text-primary">{session.user.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-body-sm text-text-secondary">Email</span>
              <span className="text-body-sm font-medium text-text-primary">{session.user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-body-sm text-text-secondary">Role</span>
              <Badge variant="accent" size="sm">Owner</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-text-tertiary" />
            <CardTitle>Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <div>
              <div className="text-body-sm font-medium text-text-primary">Theme</div>
              <div className="text-caption text-text-tertiary">Application appearance</div>
            </div>
            <Badge variant="default" size="sm">Dark</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <div>
              <div className="text-body-sm font-medium text-text-primary">Currency</div>
              <div className="text-caption text-text-tertiary">Display currency</div>
            </div>
            <span className="text-body-sm font-medium text-text-primary">INR (₹)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-body-sm font-medium text-text-primary">Notifications</div>
              <div className="text-caption text-text-tertiary">Email reminders for expirations</div>
            </div>
            <Badge variant="warning" size="sm">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-text-tertiary" />
            <CardTitle>Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server'
              await logoutUser()
              redirect('/auth/login')
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-danger-muted text-danger border border-danger/20 text-sm font-medium hover:bg-danger/20 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
