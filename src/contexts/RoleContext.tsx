import { createContext, useContext, useState, ReactNode } from 'react';

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

// Trader users (Primary and Secondary traders from spreadsheet)
export const traders: RoleUser[] = [
  { id: 'tr-1', name: 'Robert Allan', email: 'robert.allan@sefe.eu', role: 'trader' },
  { id: 'tr-2', name: 'Andrey Selikhov', email: 'andrey.selikhov@sefe.eu', role: 'trader' },
  { id: 'tr-3', name: 'Deepesh Patel', email: 'deepesh.patel@sefe.eu', role: 'trader' },
  { id: 'tr-4', name: 'Paul Smith', email: 'paul.smith@sefe.eu', role: 'trader' },
  { id: 'tr-5', name: 'Alexander Welch', email: 'alexander.welch@sefe.eu', role: 'trader' },
  { id: 'tr-6', name: 'Mauricio Cepeda', email: 'mauricio.cepeda@sefe.eu', role: 'trader' },
  { id: 'tr-7', name: 'Michael Brewin', email: 'michael.brewin@sefe.eu', role: 'trader' },
  { id: 'tr-8', name: 'Joseph Robinson', email: 'joseph.robinson@sefe.eu', role: 'trader' },
  { id: 'tr-9', name: 'Mark Rogers', email: 'mark.rogers@sefe.eu', role: 'trader' },
  { id: 'tr-10', name: 'Yulia Tikhonova', email: 'yulia.tikhonova@sefe.eu', role: 'trader' },
  { id: 'tr-11', name: 'Thomas Sparkes', email: 'thomas.sparkes@sefe.eu', role: 'trader' },
  { id: 'tr-12', name: 'Mathieu Pourcet', email: 'mathieu.pourcet@sefe.eu', role: 'trader' },
  { id: 'tr-13', name: 'Christopher Holmes', email: 'christopher.holmes@sefe.eu', role: 'trader' },
  { id: 'tr-14', name: 'Mark Prenty', email: 'mark.prenty@sefe.eu', role: 'trader' },
  { id: 'tr-15', name: 'Mathieu Marniquet', email: 'mathieu.marniquet@sefe.eu', role: 'trader' },
  { id: 'tr-16', name: 'Joshua Thomas', email: 'joshua.thomas@sefe.eu', role: 'trader' },
  { id: 'tr-17', name: 'Peter Smit', email: 'peter.smit@sefe.eu', role: 'trader' },
  { id: 'tr-18', name: 'Tomos Edwards', email: 'tomos.edwards@sefe.eu', role: 'trader' },
  { id: 'tr-19', name: 'Ugo Iozzo', email: 'ugo.iozzo@sefe.eu', role: 'trader' },
  { id: 'tr-20', name: 'Marilia Libermann', email: 'marilia.libermann@sefe.eu', role: 'trader' },
  { id: 'tr-21', name: 'Jonathan Taubert', email: 'jonathan.taubert@sefe.eu', role: 'trader' },
  { id: 'tr-22', name: 'Jeremy Burns', email: 'jeremy.burns@sefe.eu', role: 'trader' },
  { id: 'tr-23', name: 'Jijia Zuo', email: 'jijia.zuo@sefe.eu', role: 'trader' },
  { id: 'tr-24', name: 'Nikolaos Troullinos', email: 'nikolaos.troullinos@sefe.eu', role: 'trader' },
  { id: 'tr-25', name: 'Ali Farah', email: 'ali.farah@sefe.eu', role: 'trader' },
  { id: 'tr-26', name: 'Anthony Antunes', email: 'anthony.antunes@sefe.eu', role: 'trader' },
  { id: 'tr-27', name: 'Ben Cranny', email: 'ben.cranny@sefe.eu', role: 'trader' },
  { id: 'tr-28', name: 'Alastair Hill', email: 'alastair.hill@sefe.eu', role: 'trader' },
  { id: 'tr-29', name: 'Peter Melrose', email: 'peter.melrose@sefe.eu', role: 'trader' },
  { id: 'tr-30', name: 'Sabri Benharrats', email: 'sabri.benharrats@sefe.eu', role: 'trader' },
  { id: 'tr-31', name: 'Ghassan Matta', email: 'ghassan.matta@sefe.eu', role: 'trader' },
  { id: 'tr-32', name: 'Stefano Nanni', email: 'stefano.nanni@sefe.eu', role: 'trader' },
  { id: 'tr-33', name: 'Olaf Drever', email: 'olaf.drever@sefe.eu', role: 'trader' },
  { id: 'tr-34', name: 'Jiaolong Wang', email: 'jiaolong.wang@sefe.eu', role: 'trader' },
  { id: 'tr-35', name: 'Paul Crone', email: 'paul.crone@sefe.eu', role: 'trader' },
  { id: 'tr-36', name: 'Alexander Richardson', email: 'alexander.richardson@sefe.eu', role: 'trader' },
  { id: 'tr-37', name: 'Rhidhi Sheth', email: 'rhidhi.sheth@sefe.eu', role: 'trader' },
  { id: 'tr-38', name: 'Laurent Maurice-Vallerey', email: 'laurent.mauricevallerey@sefe.eu', role: 'trader' },
  { id: 'tr-39', name: 'Sonia Gulati', email: 'sonia.gulati@sefe.eu', role: 'trader' },
  { id: 'tr-40', name: 'Shiang Ying Ong', email: 'shiangying.ong@sefe.eu', role: 'trader' },
  { id: 'tr-41', name: 'Joshua Frost', email: 'joshua.frost@sefe.eu', role: 'trader' },
  { id: 'tr-42', name: 'Marcus Bredin', email: 'marcus.bredin@sefe.eu', role: 'trader' },
  { id: 'tr-43', name: 'David Gooddy', email: 'david.gooddy@sefe.eu', role: 'trader' },
  { id: 'tr-44', name: 'Erenjeeve Hothi', email: 'erenjeeve.hothi@sefe.eu', role: 'trader' },
  { id: 'tr-45', name: 'Sergey Ayrapetyan', email: 'sergey.ayrapetyan@sefe.eu', role: 'trader' },
  { id: 'tr-46', name: 'Andrew Shepherd', email: 'andrew.shepherd@sefe.eu', role: 'trader' },
  { id: 'tr-47', name: 'Sebastian Dorkel', email: 'sebastian.dorkel@sefe.eu', role: 'trader' },
  { id: 'tr-48', name: 'Connor Routh', email: 'connor.routh@sefe.eu', role: 'trader' },
  { id: 'tr-49', name: 'Jake Murphy', email: 'jake.murphy@sefe.eu', role: 'trader' },
  { id: 'tr-50', name: 'Jessica Helgesen', email: 'jessica.helgesen@sefe.eu', role: 'trader' },
  { id: 'tr-51', name: 'Robert den Bergh', email: 'robert.denbergh@sefe.eu', role: 'trader' },
  { id: 'tr-52', name: 'George Mikhalev', email: 'george.mikhalev@sefe.eu', role: 'trader' },
  { id: 'tr-53', name: 'Misha Wolynski', email: 'misha.wolynski@sefe.eu', role: 'trader' },
  { id: 'tr-54', name: 'Callum Sinclair', email: 'callum.sinclair@sefe.eu', role: 'trader' },
  { id: 'tr-55', name: 'Nathan Dixon', email: 'nathan.dixon@sefe.eu', role: 'trader' },
  { id: 'tr-56', name: 'Mikahil Potapenko', email: 'mikahil.potapenko@sefe.eu', role: 'trader' },
  { id: 'tr-57', name: 'Alessandro Mori', email: 'alessandro.mori@sefe.eu', role: 'trader' },
  { id: 'tr-58', name: 'Edward Gomersall', email: 'edward.gomersall@sefe.eu', role: 'trader' },
  { id: 'tr-59', name: 'Morgan Coran', email: 'morgan.coran@sefe.eu', role: 'trader' },
  { id: 'tr-60', name: 'Brandon Rust', email: 'brandon.rust@sefe.eu', role: 'trader' },
  { id: 'tr-61', name: 'Paul Bajan', email: 'paul.bajan@sefe.eu', role: 'trader' },
  { id: 'tr-62', name: 'Jean-Manuel Conil-Lacoste', email: 'jeanmanuel.conillacoste@sefe.eu', role: 'trader' },
  { id: 'tr-63', name: 'Derek Caldwell', email: 'derek.caldwell@sefe.eu', role: 'trader' },
  { id: 'tr-64', name: 'Toos Van De Plas', email: 'toos.vandeplas@sefe.eu', role: 'trader' },
  { id: 'tr-65', name: 'Zhenning Teo', email: 'zhenning.teo@sefe.eu', role: 'trader' },
  { id: 'tr-66', name: 'Josh Atherall', email: 'josh.atherall@sefe.eu', role: 'trader' },
  { id: 'tr-67', name: 'Eddie Ramprakash', email: 'eddie.ramprakash@sefe.eu', role: 'trader' },
  { id: 'tr-68', name: 'Christopher Holmes', email: 'christopher.holmes@sefe.eu', role: 'trader' },
  { id: 'tr-69', name: 'Karoly Schmidt', email: 'karoly.schmidt@sefe.eu', role: 'trader' },
];

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeUser: RoleUser;
  selectedPCIndex: number;
  setSelectedPCIndex: (index: number) => void;
  selectedTraderIndex: number;
  setSelectedTraderIndex: (index: number) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('product_controller');
  const [selectedPCIndex, setSelectedPCIndex] = useState(0);
  const [selectedTraderIndex, setSelectedTraderIndex] = useState(0);

  const activeUser: RoleUser = currentRole === 'product_controller' 
    ? productControllers[selectedPCIndex]
    : traders[selectedTraderIndex];

  return (
    <RoleContext.Provider value={{ 
      currentRole, 
      setCurrentRole, 
      activeUser, 
      selectedPCIndex, 
      setSelectedPCIndex,
      selectedTraderIndex,
      setSelectedTraderIndex,
    }}>
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
