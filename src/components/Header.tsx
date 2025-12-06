import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/mockData';
import { NavLink } from '@/components/NavLink';

export function Header() {
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
            <NavLink
              to="/"
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
              activeClassName="text-foreground bg-muted"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/trader"
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
              activeClassName="text-foreground bg-muted"
            >
              Trader View
            </NavLink>
            <NavLink
              to="/books"
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/50"
              activeClassName="text-foreground bg-muted"
            >
              Book List
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
