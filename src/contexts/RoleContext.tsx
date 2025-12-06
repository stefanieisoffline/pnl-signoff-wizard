import { createContext, useContext, useState, ReactNode } from 'react';
import { currentUser } from '@/lib/mockData';
import { traderUser } from '@/components/TraderDashboard';

export type UserRole = 'product_controller' | 'trader';

interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeUser: RoleUser;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('product_controller');

  const activeUser: RoleUser = currentRole === 'product_controller' 
    ? { ...currentUser, role: 'product_controller' }
    : { ...traderUser, role: 'trader' };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, activeUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
