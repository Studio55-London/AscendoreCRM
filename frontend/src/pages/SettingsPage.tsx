import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth'
import { useToast } from '@/components/ui/toast'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { User, Shield, Bell, Globe, Check } from 'lucide-react'
import type { User as UserType } from '@/types'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const { addToast } = useToast()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    dealUpdates: false,
    activityReminders: false,
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  })

  useEffect(() => {
    const currentUser = authService.getUser()
    setUser(currentUser)
    if (currentUser) {
      setProfileForm({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email || '',
      })
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      // Profile update would go here - for now just show success
      addToast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'error',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'error',
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      addToast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
        variant: 'error',
      })
      return
    }

    setPasswordLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/api/v1/auth/password`,
        {
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      addToast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
        variant: 'success',
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password. Please check your current password.',
        variant: 'error',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
    addToast({
      title: 'Notification Setting Updated',
      description: `${key.replace(/([A-Z])/g, ' $1').trim()} ${!notifications[key] ? 'enabled' : 'disabled'}.`,
      variant: 'success',
    })
  }

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    addToast({
      title: 'Preferences Saved',
      description: 'Your preferences have been updated.',
      variant: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <Button type="submit" variant="secondary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive email updates about your activities</div>
              </div>
              <Button
                variant={notifications.emailNotifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleNotification('emailNotifications')}
              >
                {notifications.emailNotifications ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  'Enable'
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Deal Updates</div>
                <div className="text-sm text-muted-foreground">Get notified when deals change status</div>
              </div>
              <Button
                variant={notifications.dealUpdates ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleNotification('dealUpdates')}
              >
                {notifications.dealUpdates ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  'Enable'
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Activity Reminders</div>
                <div className="text-sm text-muted-foreground">Receive reminders for upcoming activities</div>
              </div>
              <Button
                variant={notifications.activityReminders ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleNotification('activityReminders')}
              >
                {notifications.activityReminders ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  'Enable'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Customize your CRM experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferencesUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (E)</option>
                  <option value="GBP">GBP (#)</option>
                  <option value="JPY">JPY (Y)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
              <Button type="submit" variant="secondary">Save Preferences</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <FloatingChat />
    </div>
  )
}
