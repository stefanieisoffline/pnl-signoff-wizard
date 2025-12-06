export type SignOffStatus = 'signed' | 'pending' | 'rejected' | 'none';

export interface SignOffRecord {
  date: string;
  status: SignOffStatus;
  signedBy?: string;
  signedAt?: string;
  comment?: string;
}

export interface Book {
  id: string;
  name: string;
  desk: string;
  primaryTrader: string;
  secondaryTrader: string;
  deskHead: string;
  productController: string;
  isRetired: boolean;
  signOffs: SignOffRecord[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trader' | 'product_controller' | 'desk_head';
}

// Get last N working days (excluding weekends)
export function getLastWorkingDays(count: number): string[] {
  const days: string[] = [];
  let date = new Date();
  
  while (days.length < count) {
    date.setDate(date.getDate() - 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(date.toISOString().split('T')[0]);
    }
  }
  
  return days;
}

export function formatWorkingDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short' 
  });
}

const workingDays = getLastWorkingDays(5);

const generateSignOffs = (statuses: SignOffStatus[]): SignOffRecord[] => {
  return workingDays.map((date, index) => ({
    date,
    status: statuses[index] || 'none',
    signedBy: statuses[index] === 'signed' ? 'John Smith' : undefined,
    signedAt: statuses[index] === 'signed' ? '09:45' : undefined,
    comment: statuses[index] === 'rejected' ? 'Variance above threshold' : undefined,
  }));
};

export const mockBooks: Book[] = [
  {
    id: '1',
    name: 'EU Power Options',
    desk: 'Power Trading',
    primaryTrader: 'John Smith',
    secondaryTrader: 'Sarah Johnson',
    deskHead: 'Michael Chen',
    productController: 'Emma Wilson',
    isRetired: false,
    signOffs: generateSignOffs(['signed', 'signed', 'pending', 'signed', 'signed']),
  },
  {
    id: '2',
    name: 'UK Gas Futures',
    desk: 'Gas Trading',
    primaryTrader: 'David Brown',
    secondaryTrader: 'Lisa Anderson',
    deskHead: 'Robert Taylor',
    productController: 'Emma Wilson',
    isRetired: false,
    signOffs: generateSignOffs(['signed', 'rejected', 'signed', 'signed', 'pending']),
  },
  {
    id: '3',
    name: 'Carbon Credits',
    desk: 'Environmental',
    primaryTrader: 'James Wilson',
    secondaryTrader: 'Amy Davis',
    deskHead: 'Chris Martin',
    productController: 'Tom Harris',
    isRetired: false,
    signOffs: generateSignOffs(['pending', 'pending', 'signed', 'signed', 'signed']),
  },
  {
    id: '4',
    name: 'LNG Swaps',
    desk: 'Gas Trading',
    primaryTrader: 'Peter Jones',
    secondaryTrader: 'Rachel Green',
    deskHead: 'Robert Taylor',
    productController: 'Tom Harris',
    isRetired: false,
    signOffs: generateSignOffs(['signed', 'signed', 'signed', 'signed', 'signed']),
  },
  {
    id: '5',
    name: 'Nordic Power',
    desk: 'Power Trading',
    primaryTrader: 'Erik Svensson',
    secondaryTrader: 'Anna Berg',
    deskHead: 'Michael Chen',
    productController: 'Emma Wilson',
    isRetired: false,
    signOffs: generateSignOffs(['rejected', 'signed', 'signed', 'pending', 'signed']),
  },
  {
    id: '6',
    name: 'Dutch TTF',
    desk: 'Gas Trading',
    primaryTrader: 'Hans Mueller',
    secondaryTrader: 'Klaus Weber',
    deskHead: 'Robert Taylor',
    productController: 'Emma Wilson',
    isRetired: true,
    signOffs: generateSignOffs(['none', 'none', 'none', 'none', 'none']),
  },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Emma Wilson', email: 'emma.wilson@sefe.eu', role: 'product_controller' },
  { id: '2', name: 'Tom Harris', email: 'tom.harris@sefe.eu', role: 'product_controller' },
  { id: '3', name: 'John Smith', email: 'john.smith@sefe.eu', role: 'trader' },
  { id: '4', name: 'David Brown', email: 'david.brown@sefe.eu', role: 'trader' },
  { id: '5', name: 'Michael Chen', email: 'michael.chen@sefe.eu', role: 'desk_head' },
];

export const currentUser: User = mockUsers[0]; // Emma Wilson as Product Controller

export const desks = ['Power Trading', 'Gas Trading', 'Environmental'];
