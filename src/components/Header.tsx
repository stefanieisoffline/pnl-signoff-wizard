import { Settings, User, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useRole, productControllers } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { currentRole, setCurrentRole, activeUser, selectedPCIndex, setSelectedPCIndex } = useRole();
  const navigate = useNavigate();

  const handleRoleSwitch = (role: 'product_controller' | 'trader', pcIndex?: number) => {
    setCurrentRole(role);
    if (role === 'product_controller' && pcIndex !== undefined) {
      setSelectedPCIndex(pcIndex);
    }
    navigate(role === 'product_controller' ? '/' : '/trader');
  };

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
            userEmail={currentRole === 'trader' 
              ? 'robert.allan@sefe-energy.com' 
              : activeUser.email
            } 
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {currentRole === 'product_controller' ? 'PC' : 'Trader'}
                      </Badge>
                      <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-5 w-5" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Product Controllers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {productControllers.map((pc, index) => (
                  <DropdownMenuItem
                    key={pc.id}
                    onClick={() => handleRoleSwitch('product_controller', index)}
                    className={currentRole === 'product_controller' && selectedPCIndex === index ? 'bg-muted' : ''}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{pc.name}</span>
                      <span className="text-xs text-muted-foreground">{pc.email}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Trader</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch('trader')}
                  className={currentRole === 'trader' ? 'bg-muted' : ''}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Robert Allan</span>
                    <span className="text-xs text-muted-foreground">robert.allan@sefe.eu</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
