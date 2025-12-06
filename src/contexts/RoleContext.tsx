import { createContext, useContext, useState, ReactNode } from 'react';
import { traderUser } from '@/components/TraderDashboard';

export type UserRole = 'product_controller' | 'trader';

interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Product controller users
export const productControllers: RoleUser[] = [
  { id: 'pc-1', name: 'Veronika Yastrebova', email: 'veronika.yastrebova@sefe.eu', role: 'product_controller' },
  { id: 'pc-2', name: 'Stefanie Shi', email: 'stefanie.shi@sefe.eu', role: 'product_controller' },
  { id: 'pc-3', name: 'James Thomas', email: 'james.thomas@sefe.eu', role: 'product_controller' },
  { id: 'pc-4', name: 'Kelly Lim', email: 'kelly.lim@sefe.eu', role: 'product_controller' },
  { id: 'pc-5', name: 'Ruslan Markov', email: 'ruslan.markov@sefe.eu', role: 'product_controller' },
  { id: 'pc-6', name: 'Demi Comitis', email: 'demi.comitis@sefe.eu', role: 'product_controller' },
  { id: 'pc-7', name: 'Khor Mei Leng', email: 'khor.meileng@sefe.eu', role: 'product_controller' },
  { id: 'pc-8', name: 'Jorge Barbera', email: 'jorge.barbera@sefe.eu', role: 'product_controller' },
  { id: 'pc-9', name: 'Lule Halimi', email: 'lule.halimi@sefe.eu', role: 'product_controller' },
  { id: 'pc-10', name: 'Ero Kapatos', email: 'ero.kapatos@sefe.eu', role: 'product_controller' },
  { id: 'pc-11', name: 'Vinny Sharma', email: 'vinny.sharma@sefe.eu', role: 'product_controller' },
  { id: 'pc-12', name: 'Jasdeep Dhaliwal', email: 'jasdeep.dhaliwal@sefe.eu', role: 'product_controller' },
  { id: 'pc-13', name: 'Jonas Koch', email: 'jonas.koch@sefe.eu', role: 'product_controller' },
];

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeUser: RoleUser;
  selectedPCIndex: number;
  setSelectedPCIndex: (index: number) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('product_controller');
  const [selectedPCIndex, setSelectedPCIndex] = useState(0);

  const activeUser: RoleUser = currentRole === 'product_controller' 
    ? productControllers[selectedPCIndex]
    : { ...traderUser, role: 'trader' };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, activeUser, selectedPCIndex, setSelectedPCIndex }}>
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
