import { Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { currentRole, activeUser, logout } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'product_controller':
        return 'PC';
      case 'trader':
        return 'Trader';
      case 'desk_head':
        return 'Desk Head';
      default:
        return '';
    }
  };

  if (!activeUser) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              SE
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">SEFE P&L Sign-Off</h1>
              <p className="text-xs text-muted-foreground">Trading Report Management</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {currentRole === 'product_controller' ? (
              <>
                <NavLink
                  to="/"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
                  activeClassName="text-foreground bg-muted"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/books"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
                  activeClassName="text-foreground bg-muted"
                >
                  Book List
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/trader"
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
                activeClassName="text-foreground bg-muted"
              >
                My Reports
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell 
            userEmail={activeUser.email} 
          />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{activeUser.name}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {getRoleBadge()}
                    </Badge>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-5 w-5" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{activeUser.name}</p>
                  <p className="text-xs text-muted-foreground">{activeUser.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}