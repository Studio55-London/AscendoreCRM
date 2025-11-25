import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GlobalSearch } from '@/components/ui/global-search'
import { authService } from '@/services/auth'
import { getInitials } from '@/utils/format'

interface HeaderProps {
  sidebarCollapsed: boolean
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 right-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ left: sidebarCollapsed ? '64px' : '256px' }}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center flex-1 max-w-2xl">
          <GlobalSearch />
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
            </Button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg z-50">
                  <div className="px-3 py-2 text-sm border-b mb-1">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/settings')
                    }}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
