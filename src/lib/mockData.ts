export type SignOffStatus = 'signed' | 'pending' | 'rejected' | 'none';

export interface SignOffRecord {
  date: string;
  status: SignOffStatus;
  signedBy?: string;
  signedAt?: string;
  comment?: string;
}

export interface BookComment {
  id: string;
  bookId: string;
  date: string; // The reporting date this comment is about
  authorName: string;
  authorRole: 'trader' | 'product_controller' | 'desk_head';
  content: string;
  createdAt: string;
  parentId?: string; // For replies
  readByPC?: boolean; // Whether product controller has read this comment
  readByTrader?: boolean; // Whether trader has read this comment
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
  comments: BookComment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trader' | 'product_controller' | 'desk_head';
}

// Bank holidays storage key
const BANK_HOLIDAYS_KEY = 'sefe_bank_holidays';

// Get bank holidays from localStorage
export function getBankHolidays(): string[] {
  try {
    const stored = localStorage.getItem(BANK_HOLIDAYS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Add a bank holiday
export function addBankHoliday(date: string): void {
  const holidays = getBankHolidays();
  if (!holidays.includes(date)) {
    holidays.push(date);
    localStorage.setItem(BANK_HOLIDAYS_KEY, JSON.stringify(holidays));
  }
}

// Remove a bank holiday
export function removeBankHoliday(date: string): void {
  const holidays = getBankHolidays().filter(h => h !== date);
  localStorage.setItem(BANK_HOLIDAYS_KEY, JSON.stringify(holidays));
}

// Check if a date is a bank holiday
export function isBankHoliday(date: string): boolean {
  return getBankHolidays().includes(date);
}

// Get last N working days (excluding weekends and bank holidays)
// Returns dates in descending order (most recent first)
export function getLastWorkingDays(count: number): string[] {
  const days: string[] = [];
  let date = new Date();
  const bankHolidays = getBankHolidays();
  
  while (days.length < count) {
    date.setDate(date.getDate() - 1);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends and bank holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !bankHolidays.includes(dateStr)) {
      days.push(dateStr);
    }
  }
  
  // Already in descending order (most recent first)
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

// Generate sign-offs for 10 working days to support extended date range
const workingDays = getLastWorkingDays(10);

const generateRandomSignOffs = (): SignOffRecord[] => {
  const statuses: SignOffStatus[] = ['signed', 'pending', 'rejected'];
  const weights = [0.65, 0.25, 0.1]; // More signed than pending/rejected, no "none" status
  
  return workingDays.map((date, index) => {
    // Most recent day (index 0) is always pending (new day starts with pending)
    if (index === 0) {
      return {
        date,
        status: 'pending' as SignOffStatus,
        signedBy: undefined,
        signedAt: undefined,
        comment: undefined,
      };
    }
    
    const rand = Math.random();
    let status: SignOffStatus = 'signed';
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        status = statuses[i];
        break;
      }
    }
    
    return {
      date,
      status,
      signedBy: status === 'signed' ? 'Auto-signed' : undefined,
      signedAt: status === 'signed' ? '09:45' : undefined,
      comment: status === 'rejected' ? 'Variance above threshold' : undefined,
    };
  });
};

// Real book data from SEFE
const bookData = [
  { name: "Area D", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "Asset Optimisation", primaryTrader: "Andrey Selikhov", secondaryTrader: "Ali Farah", deskHead: "Dom Both", desk: "Energy Transition", productController: "Kelly Lim" },
  { name: "CEGH Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "CONTI_GAS_STRUCTURES_6", primaryTrader: "Paul Smith", secondaryTrader: "Ghassan Matta", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Capital Solutions", primaryTrader: "Alexander Welch", secondaryTrader: "Sebastian Dorkel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Carbon Cross Commodity", primaryTrader: "Mauricio Cepeda", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Carbon Management Position", primaryTrader: "Mauricio Cepeda", secondaryTrader: "Ghassan Matta", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Carbon Options", primaryTrader: "Mauricio Cepeda", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Carbon Trading", primaryTrader: "Mauricio Cepeda", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Carbon Volumetric Position", primaryTrader: "Mauricio Cepeda", secondaryTrader: "Alexander Welch", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Clean Spark Spread and UK Prompt Power", primaryTrader: "Michael Brewin", secondaryTrader: "Mathieu Pourcel", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Consolidated LNG Portfolio Position and Valuation", primaryTrader: "Joseph Robinson", secondaryTrader: "Mathieu Marniquet", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Khor Mei Leng" },
  { name: "Consolidated Oil Trading", primaryTrader: "Mark Rogers", secondaryTrader: "Ghassan Matta", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Consolidated Treasury P&L", primaryTrader: "Yulia Tikhonova", secondaryTrader: "Jessica Heilpern", deskHead: "Ben Street", desk: "Treasury", productController: "Khor Mei Leng" },
  { name: "Conti Deal Mgmt", primaryTrader: "Thomas Sparkes", secondaryTrader: "Ugo Iozzo", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Demi Comitis" },
  { name: "Conti Flow", primaryTrader: "Michael Brewin", secondaryTrader: "Connor Routh", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Conti Fuel Spread", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Conti Futures", primaryTrader: "Alexander Welch", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Conti Gas Structure 1", primaryTrader: "Christopher Holmes", secondaryTrader: "Jake Murphy", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Conti Gas Structure 2", primaryTrader: "Mark Rogers", secondaryTrader: "Paul Smith", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Conti Gas Structure 4", primaryTrader: "Mark Rogers", secondaryTrader: "Christopher Holmes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Conti Gas Structure 5", primaryTrader: "Mark Rogers", secondaryTrader: "Christopher Holmes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Conti Interconnectors Power", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Ruslan Markov" },
  { name: "Conti Profile", primaryTrader: "Michael Brewin", secondaryTrader: "Connor Routh", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Conti Spark Spread", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Conti Structured", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Robbert van den Bergh", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "DA Index Management", primaryTrader: "Mark Prenty", secondaryTrader: "Robert Allan", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "Deal Flow", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "Digital Carbon", primaryTrader: "Rhidhi Sheth", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Digital Trading", productController: "Stefanie Shi" },
  { name: "Dunkerque Regas", primaryTrader: "Mathieu Marniquet", secondaryTrader: "Joseph Robinson", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Jorge Barbera" },
  { name: "Dutch Retail", primaryTrader: "Joshua Thomas", secondaryTrader: "Tomos Edwards", deskHead: "Marcus Bredin", desk: "SPO", productController: "Demi Comitis" },
  { name: "Dutch Transportation", primaryTrader: "Peter Smit", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "EE Flow", primaryTrader: "Michael Brewin", secondaryTrader: "Jonathan Taubert", deskHead: "Michael Brewin", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "EE Gas Flow", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "EU Clean Sparks", primaryTrader: "Thomas Sparkes", secondaryTrader: "Ugo Iozzo", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "EU/UK Cross Commodity", primaryTrader: "Tomos Edwards", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "Embedded Generation", primaryTrader: "Andrey Selikhov", secondaryTrader: "Ali Farah", deskHead: "Dom Both", desk: "Energy Transition", productController: "Demi Comitis" },
  { name: "Etzel", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Etzel Virtual Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Euro Deal Management 2", primaryTrader: "Peter Smit", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Euro Deal Management 3", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Euro Deal Management 4", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Euro Deal Management 6", primaryTrader: "Mariia Libermann", secondaryTrader: "Eddie Ramprakash", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Euro Deal Management 7", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Euro Power", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "FR/UK & UK/NL Power", primaryTrader: "Jonathan Taubert", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Ruslan Markov" },
  { name: "FX Consolidated", primaryTrader: "Jeremy Burns", secondaryTrader: "Derek Caldwell", deskHead: "Jeremy Burns", desk: "FX", productController: "Khor Mei Leng" },
  { name: "Flex & Bal Retail", primaryTrader: "Tomos Edwards", secondaryTrader: "Joshua Thomas", deskHead: "Marcus Bredin", desk: "SPO", productController: "James Thomas" },
  { name: "France Retail", primaryTrader: "Joshua Thomas", secondaryTrader: "Tomos Edwards", deskHead: "Marcus Bredin", desk: "SPO", productController: "Demi Comitis" },
  { name: "Futures", primaryTrader: "Alexander Welch", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Gas Digital", primaryTrader: "Rhidhi Sheth", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Digital Trading", productController: "Stefanie Shi" },
  { name: "Gas Strategic Position", primaryTrader: "Jijia Zuo", secondaryTrader: "Ghassan Matta", deskHead: "Ghassan Matta", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "German Regas", primaryTrader: "Mathieu Marniquet", secondaryTrader: "Joseph Robinson", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Jorge Barbera" },
  { name: "German Spark Spread", primaryTrader: "Nikolaos Troullinos", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "German Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "German White Label PPAs", primaryTrader: "Andrey Selikhov", secondaryTrader: "Ali Farah", deskHead: "Dom Both", desk: "Energy Transition", productController: "Kelly Lim" },
  { name: "Hedge Storage Gas UK", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "IRE Gas", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "Index Management", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Index Swing, Stor & Struc Opt", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Intraday Imbalance Summary", primaryTrader: "Ben Cranny", secondaryTrader: "Callum Sinclair", deskHead: "Dom Both", desk: "Power Intraday", productController: "Stefanie Shi" },
  { name: "Intraday Joint Venture", primaryTrader: "Ben Cranny", secondaryTrader: "Callum Sinclair", deskHead: "Dom Both", desk: "Power Intraday", productController: "Veronika Yastrebova" },
  { name: "Intraday Power", primaryTrader: "Ben Cranny", secondaryTrader: "Callum Sinclair", deskHead: "Dom Both", desk: "Power Intraday", productController: "Veronika Yastrebova" },
  { name: "Intraday Systematic", primaryTrader: "Ben Cranny", secondaryTrader: "Callum Sinclair", deskHead: "Dom Both", desk: "Power Intraday", productController: "Veronika Yastrebova" },
  { name: "Joint Strategy P&L & Position", primaryTrader: "Alastair Hill", secondaryTrader: "Nathan Dixon", deskHead: "Nathan Dixon", desk: "EP", productController: "Vinny Sharma" },
  { name: "LNG Derivatives", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "LNG In Tank", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "LNG Portfolio FFA Trading", primaryTrader: "Peter Melrose", secondaryTrader: "Shiang Yng Ong", deskHead: "Mikhail Potapenko", desk: "LNG", productController: "Khor Mei Leng" },
  { name: "LNG Swaps Exchange Position and Valuation", primaryTrader: "Joseph Robinson", secondaryTrader: "Sabri Benharrats", deskHead: "Ghassan Matta", desk: "LNG", productController: "Khor Mei Leng" },
  { name: "LNGT Prop", primaryTrader: "Jean-Manuel Conil-Lacoste", secondaryTrader: "Alessandro Mori", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Ero Kapatos" },
  { name: "LNG_FO_GAIL_RNST_26_SLNG", primaryTrader: "Jijia Zuo", secondaryTrader: "Sabri Benharrats", deskHead: "Ghassan Matta", desk: "LNG", productController: "Ero Kapatos" },
  { name: "LNG_FO_GAIL_UQT_26_SLNG", primaryTrader: "Jijia Zuo", secondaryTrader: "Sabri Benharrats", deskHead: "Ghassan Matta", desk: "LNG", productController: "Ero Kapatos" },
  { name: "MANAGEMENT_FX_XCDY-DESK_SMT", primaryTrader: "Ghassan Matta", secondaryTrader: "Mark Rogers", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "MOD Index Management", primaryTrader: "Stefano Nanni", secondaryTrader: "Marcus Bredin", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Demi Comitis" },
  { name: "Macro Trading", primaryTrader: "Olaf Dreyer", secondaryTrader: "Morgan Corran", deskHead: "Edward Gomersall", desk: "Gas & Hub", productController: "James Thomas" },
  { name: "Management Gas", primaryTrader: "Alexander Welch", secondaryTrader: "Sebastian Dorkel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Stefanie Shi" },
  { name: "Medium Term Euro Power", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Metal Trading", primaryTrader: "Jiadong Wang", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "Metals Financing", primaryTrader: "Paul Crone", secondaryTrader: "Brandon Rust", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "Metals Strat", primaryTrader: "Paul Crone", secondaryTrader: "Brandon Rust", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "Metals Tact 1", primaryTrader: "Paul Crone", secondaryTrader: "Brandon Rust", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "Metals Tact 2", primaryTrader: "Paul Crone", secondaryTrader: "Brandon Rust", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "NAFTA Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "NBP Deal Mgmt", primaryTrader: "Thomas Sparkes", secondaryTrader: "Ugo Iozzo", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Oil Hedging Position and Valuation", primaryTrader: "Joseph Robinson", secondaryTrader: "Mathieu Marniquet", deskHead: "Ghassan Matta", desk: "LNG", productController: "Khor Mei Leng" },
  { name: "Open Retail", primaryTrader: "Marcus Bredin", secondaryTrader: "Joshua Thomas", deskHead: "Ghassan Matta", desk: "SPO", productController: "James Thomas" },
  { name: "Open Storage 1", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Open Storage 4", primaryTrader: "Andrew Shepherd", secondaryTrader: "Deepesh Patel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Origination Prop P&L & Position", primaryTrader: "Alastair Hill", secondaryTrader: "Nathan Dixon", deskHead: "Nathan Dixon", desk: "EP", productController: "Vinny Sharma" },
  { name: "PEG Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "Physical Metals", primaryTrader: "Paul Crone", secondaryTrader: "Brandon Rust", deskHead: "Dom Both", desk: "Metal Trading", productController: "Jasdeep Dhaliwal" },
  { name: "Power Analyst", primaryTrader: "Alexander Richardson", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Power Derivatives", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Power Digital", primaryTrader: "Rhidhi Sheth", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Digital Trading", productController: "Stefanie Shi" },
  { name: "Power FX Exposure", primaryTrader: "Laurent Maurice-Vallerey", secondaryTrader: "Mathieu Pourcel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "James Thomas" },
  { name: "Power Imbalance Summary", primaryTrader: "Power Operations", secondaryTrader: "Paul Bajan", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Stefanie Shi" },
  { name: "Power Management", primaryTrader: "Michael Brewin", secondaryTrader: "Mathieu Pourcel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "James Thomas" },
  { name: "Power Ops", primaryTrader: "Power Operations", secondaryTrader: "Power Ops", deskHead: "Dom Both", desk: "Energy Transition", productController: "Stefanie Shi" },
  { name: "Power Prop Options", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop 10", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 12", primaryTrader: "Joshua Thomas", secondaryTrader: "Marcus Bredin", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop 13", primaryTrader: "Thomas Sparkes", secondaryTrader: "Ugo Iozzo", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "Prop 15", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 16", primaryTrader: "Chris Holmes", secondaryTrader: "Jake Murphy", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 18", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 2", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 3", primaryTrader: "Peter Smit", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop 4", primaryTrader: "Mark Prenty", secondaryTrader: "Robert Allan", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop 5", primaryTrader: "Jake Murphy", secondaryTrader: "Christopher Holmes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 6", primaryTrader: "Jake Murphy", secondaryTrader: "Christopher Holmes", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop 7", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop 8", primaryTrader: "Josh Atherall", secondaryTrader: "Marcus Bredin", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop 9", primaryTrader: "Mariia Libermann", secondaryTrader: "Eddie Ramprakash", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Prop Derivatives 1", primaryTrader: "Misha Wolynski", secondaryTrader: "Anthony Antunes", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop Derivatives 2", primaryTrader: "Misha Wolynski", secondaryTrader: "Anthony Antunes", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop Derivatives 3 (Derivs Team Prop)", primaryTrader: "Misha Wolynski", secondaryTrader: "Anthony Antunes", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop Derivatives 4", primaryTrader: "Misha Wolynski", secondaryTrader: "Anthony Antunes", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop Options Gas", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Lule Halimi" },
  { name: "Prop Sparks", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop Sparks 2", primaryTrader: "Anthony Antunes", secondaryTrader: "Misha Wolynski", deskHead: "Sebastian Dorkel", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "Prop Transport 2", primaryTrader: "Peter Smit", secondaryTrader: "Robert Allan", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Veronika Yastrebova" },
  { name: "ROCs, GOOs & REGO", primaryTrader: "Sonia Gulati", secondaryTrader: "Toon Van De Plas", deskHead: "Dom Both", desk: "Energy Transition", productController: "Kelly Lim" },
  { name: "Regas Zee", primaryTrader: "Mathieu Marniquet", secondaryTrader: "Joseph Robinson", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Jorge Barbera" },
  { name: "Retail Power", primaryTrader: "Tomos Edwards", secondaryTrader: "Joshua Thomas", deskHead: "Marcus Bredin", desk: "SPO", productController: "James Thomas" },
  { name: "SEFE LNG P&L and Exposure", primaryTrader: "Shiang Yng Ong", secondaryTrader: "Zhenxing Teo", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Kelly Lim" },
  { name: "SMTS LNG P&L and Exposure", primaryTrader: "Shiang Yng Ong", secondaryTrader: "Zhenxing Teo", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Kelly Lim" },
  { name: "SOCAR Index", primaryTrader: "Ugo Iozzo", secondaryTrader: "Thomas Sparkes", deskHead: "Ghassan Matta", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "SPO Analyst", primaryTrader: "Joshua Frost", secondaryTrader: "Tomos Edwards", deskHead: "Marcus Bredin", desk: "SPO", productController: "James Thomas" },
  { name: "SPO DE Power Flow", primaryTrader: "Tomos Edwards", secondaryTrader: "Joshua Thomas", deskHead: "Marcus Bredin", desk: "SPO", productController: "Jonas Koch" },
  { name: "SPO Index", primaryTrader: "Marcus Bredin", secondaryTrader: "Josh Atherall", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Demi Comitis" },
  { name: "SPO MAV Index", primaryTrader: "Stefano Nanni", secondaryTrader: "Marcus Bredin", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "Sales Gas", primaryTrader: "Commercial Process & Control", secondaryTrader: "Commercial Process & Control", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Stefanie Shi" },
  { name: "Short Term I/C Power", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Laurent Maurice-Vallerey", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Ruslan Markov" },
  { name: "Spanish Regas", primaryTrader: "David Gooddy", secondaryTrader: "Alessandro Mori", deskHead: "Jean-Manuel Conil-Lacoste", desk: "LNG", productController: "Jorge Barbera" },
  { name: "Strat Positions Power", primaryTrader: "Mathieu Pourcel", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "Systematic Cross Com - DT²", primaryTrader: "Rhidhi Sheth", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Digital Trading", productController: "Stefanie Shi" },
  { name: "True North", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Demi Comitis" },
  { name: "UK Deal Flow Power", primaryTrader: "Michael Brewin", secondaryTrader: "Jonathan Taubert", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "UK Retail Fixed", primaryTrader: "Tomos Edwards", secondaryTrader: "Joshua Thomas", deskHead: "Marcus Bredin", desk: "SPO", productController: "James Thomas" },
  { name: "UK Spark Spread", primaryTrader: "Jonathan Taubert", secondaryTrader: "Michael Brewin", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Demi Comitis" },
  { name: "UK Stack & DA Conti Stack", primaryTrader: "Erenjeeve Hothi", secondaryTrader: "Jonathan Taubert", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "James Thomas" },
  { name: "UK Storage", primaryTrader: "Deepesh Patel", secondaryTrader: "Andrew Shepherd", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "UK Storage 2", primaryTrader: "Alexander Welch", secondaryTrader: "Sebastian Dorkel", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Kelly Lim" },
  { name: "US Digital Trading", primaryTrader: "Rhidhi Sheth", secondaryTrader: "George Mikhalev", deskHead: "Dom Both", desk: "Digital Trading", productController: "Stefanie Shi" },
  { name: "WIEE Transport and Flow", primaryTrader: "Sergey Ayrapetyan", secondaryTrader: "Karoly Schmidt", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "WINGAS Deal Management", primaryTrader: "Mark Prenty", secondaryTrader: "Robert Allan", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
  { name: "XCom SMT", primaryTrader: "Paul Smith", secondaryTrader: "Ghassan Matta", deskHead: "Ghassan Matta", desk: "Cross Commodity", productController: "Veronika Yastrebova" },
  { name: "ZTP WD BALANCING", primaryTrader: "Robert Allan", secondaryTrader: "Mark Prenty", deskHead: "Ed Humphreys", desk: "Gas & Hub", productController: "Ruslan Markov" },
];

const workingDaysForComments = getLastWorkingDays(5);

// Generate sample comments for some books
const generateSampleComments = (bookId: string, bookName: string, primaryTrader: string, deskHead: string): BookComment[] => {
  const shouldHaveComments = Math.random() > 0.7; // 30% of books have comments
  if (!shouldHaveComments) return [];

  const comments: BookComment[] = [];
  const numComments = Math.floor(Math.random() * 3) + 1;

  const sampleMessages = [
    "Please review the variance on this report",
    "P&L figures look unusual for this period",
    "Need clarification on the hedge positions",
    "Waiting for updated market data",
    "Position reconciliation pending",
    "Query on the MTM calculation",
  ];

  for (let i = 0; i < numComments; i++) {
    const isFromDeskHead = Math.random() > 0.7;
    const hoursAgo = Math.floor(Math.random() * 48);
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    const authorRole: 'trader' | 'desk_head' = isFromDeskHead ? 'desk_head' : 'trader';
    
    // Trader/desk head comments are unread by PC
    // Mark some as read randomly for demo (recent comments more likely to be unread)
    const isRecent = hoursAgo < 12;
    
    comments.push({
      id: `comment-${bookId}-${i}`,
      bookId,
      date: workingDaysForComments[Math.floor(Math.random() * workingDaysForComments.length)],
      authorName: isFromDeskHead ? deskHead : primaryTrader,
      authorRole,
      content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      createdAt,
      readByPC: !isRecent || Math.random() > 0.6, // Recent comments are more likely unread
      readByTrader: true, // Trader's own comments or desk head comments are "read" by traders
    });
  }

  return comments;
};

// Retired books list
const retiredBookNames = [
  "AB_GAS_UK",
  "ALGO_10_FX_UK",
  "ALGO_11_FX_UK",
  "ALGO_12_FX_UK",
  "ALGO_13_FX_UK",
  "ALGO_14_FX_UK",
  "ALGO_15_FX_UK",
  "ALGO_16_FX_UK",
  "ALGO_17_FX_UK",
  "ALGO_18_FX_UK",
  "ALGO_19_FX_UK",
  "ALGO_2_FX_UK",
  "ALGO_20_FX_UK",
  "ALGO_3_FX_UK",
  "ALGO_4_FX_UK",
  "ALGO_5_FX_UK",
  "ALGO_6_FX_UK",
  "ALGO_7_FX_UK",
  "ALGO_8_FX_UK",
  "ALGO_9_FX_UK",
  "ALGO_FX_UK",
  "ALGO_MAPPING_FX_UK",
  "AREA_D_GAS_UK",
  "AT_CZ_PWR_UK",
  "AT_HU_PWR_UK",
  "BALTIC_CLEAN_STORAGE_CH",
  "BASIS_PROP_GAS_UK",
  "BE_RE_GAS_UK",
  "BE_TRANSPORT_GAS_UK",
  "BERG_STOR_GAS_UK",
  "BIOMASS_CB_SG",
  "BUS_DEV_C&SE_EU_CH",
  "CAPACITY_POWER_CH",
  "CARBON_FUTURES_PWR_UK",
  "CARBON_REPO_SG",
  "CARBON_RETAIL_SALES_PWR",
  "CARBON2_PWR_UK",
  "CARBONFX_CB_SG",
  "CARBONFX_CB_UK",
  "CER_PORTFOLIO_PWR_UK",
  "CER_PROJ_PWR_SG",
  "CLEAN_OIL_US",
  "CLOSEOUT_AVU",
  "CLOSEOUT_CASTLETON_GAS_UK",
  "CLOSEOUT_FX_UK",
  "CLOSEOUT_GAS_UK",
  "CLOSEOUT_METI_GAS_UK",
  "COAL_ORIG_PWR_UK",
  "COAL_PROP_OPTIONS_GAS_UK",
  "COAL_PWR_UK",
  "COAL_SPREADS_PWR_UK",
  "COAL_SWAP_SG",
  "CONDENSATE_PHY_HEDGE_SG",
  "CONTI_CURVE_PWR_UK",
  "CONTI_FUTURES_USD_GAS_UK",
  "CONTI_FWD_PWR_UK",
  "CONTI_INDEX_MGT_GAS_UK",
  "CONTI_PROP_GAS_UK",
  "CONTI_SPREADS_GAS_UK",
  "CORY_EMGEN_PWR_UK",
  "CRUDE_CH",
  "CRUDE_DELTA_CH",
  "CRUDE_PAPER_CH",
  "CRUDE_PHY_HEDGE_SG",
  "CRUDE_PHY_OPTIMISATION_SG",
  "CRUDE_SBC_OPTIMISATION_SG",
  "CRUDE_SPEC_SG",
  "DE_FR_PWR_UK",
  "DE_TRANSPORT_GAS_UK",
  "DE_UKR_PWR_UK",
  "DERIV_WINGAS_PS_GAS_UK",
  "DIGITAL_PROFITSHARE1_PWR_UK",
  "DIGITAL_PROFITSHARE2_PWR_UK",
  "DIGITAL_PROFITSHARE3_PWR_UK",
  "DNK_REGAS_COSTS_2023_SMT",
  "DNK_REGAS_COSTS_LNG_2023_SLNG",
  "DNK_REGAS_JV_2023_SMT",
  "DNK_REGAS_JV_LNG_2023_SLNG",
  "DUAL_DEAL_MANAGEMENT_GAS_UK",
  "DUMMY_BAL_FLOW_GAS_UK",
  "DUMMY_LNG_HA_UNIT_TRADE_SG",
  "DUTCH_SPARKS_PWR_UK",
  "EC_STRAT_PWR_UK",
  "EQUITY_SUPPLY_FIXOIL_GAS_DE",
  "EQUITY_SUPPLY_FLEX_GAS_DE",
  "EU_DIRTY_SPARKS_PWR_UK",
  "EUA_OPTIONS_CB_UK",
  "EUA_OPTIONS_PWR_UK",
  "EUA_TECHNICAL_PWR_UK",
  "EUR_DEAL2",
  "EUR_SPDS_SHRT_PWR_UK",
  "EURO_DEAL_MGT1_GAS_UK",
  "EURO_DEAL_MGT5_GAS_UK",
  "EURO_DEAL_MGT8_GAS_UK",
  "EURO_SPARK_PROP_GAS_UK",
  "EXXON_DEAL_MGT_GAS_UK",
  "FIN_OPT_GGLNG",
  "FINANCIAL_GAS_UK",
  "FR_PORT_GAS_UK",
  "FR_RE_FIXED_2_GAS_UK",
  "FR_RE_FIXED_GAS_UK",
  "FR_RE_GAS_INDEX_GAS_UK",
  "FR_RE_OIL_UK",
  "FR_RE_STOR_GAS_UK",
  "FR_RET_LIGHTSHIP_INDEX_GAS_UK",
  "FR_RET_OPEN_GAS_UK",
  "FR_TRANSPORT_GAS_UK",
  "FUEL_OIL_CH",
  "FUTURES_USD_GAS_UK",
  "FX_HDG_LNG_UK",
  "GAS_COND_CH",
  "GAS_FX_ROLL_GAS_UK",
  "GAS_TF1_DGTL_UK",
  "GASLN_COMP_STORAGE_CH",
  "GASOLINE_CH",
  "GASTERRA_STOR_GAS_UK",
  "GLOBAL_GAS_PROP_GAS_UK",
  "GLOBAL_SPREAD_MGMT_GAS_UK",
  "GLOBAL_SPREAD_MGMT2_GAS_UK",
  "GPL_PS_STOR_GAS_UK",
  "GPL_S_STORSWING_GAS_UK",
  "GPL2_PS_STOR_GAS_UK",
  "GPLL_PS_STOR_GAS_UK",
  "GTF_B_STOR_GAS_UK",
  "HEDGE_STOR_GAS_UK",
  "HH_DEAL_MGMT_GAS_UK",
  "HU_RO_PWR_UK",
  "HUMBLY_STOR_GAS_UK",
  "INDEX_SPB_GAS_UK",
  "INTDY_IC_FRUK_PWR_UK",
  "INTDY_IC_NLDE_PWR_UK",
  "INTDY_IC_UKNL_PWR_UK",
  "INTEGRAL_FX_UK",
  "INTERNAL_SWING_GAS_UK",
  "INTRADAY_JOINTVENTURE_2_PWR_UK",
  "INTRADAY_SYSTEMATIC_1_PWR_UK",
  "INTRADAY_SYSTEMATIC_2_PWR_UK",
  "INTRADAY_SYSTEMATIC_5_PWR_UK",
  "INTRADAY_SYSTEMATIC_PWR_UK",
  "ITALIAN_CLEAN_SPARKS_PWR_UK",
  "IUK_INVENTORY_GAS_UK",
  "JCC_DERIVATIVES_2019_LNG_SG",
  "JCC_DERIVATIVES_2020_LNG_SG",
  "JCC_DERIVATIVES_2021_LNG_SG",
  "JCC_DERIVATIVES_2022_LNG_SG",
  "JCC_DERIVATIVES_2023_LNG_SG",
  "JCC_DERIVATIVES_LNG_SG",
  "JCC_DERIVATIVES_LNG_UK",
  "LIGHT_ENDS_CH",
  "LNG_DEAL_MGT_GAS_UK",
  "LNG_DERIVS_MGT_GAS_UK",
  "LNG_FIN_HEDGE_GGLNG",
  "LNG_FIN_HEDGE_SG",
  "LNG_FIN_SPEC_GGLNG",
  "LNG_HA_2022_GGLNG",
  "LNG_HA_2022_SG",
  "LNG_HA_2023_GGLNG",
  "LNG_HA_2023_SG",
  "LNG_HA_UNIT_TRADE_SG",
  "LNG_HEDGE_GAS_UK",
  "LNG_HEDGING_OIL_UK",
  "LNG_PHYS_NONSEIC_GGLNG",
  "LNG_PHYS_SEIC_GGLNG",
  "LNG_PHYS_SEIC_SG",
  "LNG_PORTFOLIO_2018_GGLNG",
  "LNG_PORTFOLIO_2018_SG",
  "LNG_PORTFOLIO_2019_GGLNG",
  "LNG_PORTFOLIO_2019_SG",
  "LNG_PORTFOLIO_2020_GGLNG",
  "LNG_PORTFOLIO_2020_SG",
  "LNG_PORTFOLIO_2021_GGLNG",
  "LNG_PORTFOLIO_2021_SG",
  "LNG_PORTFOLIO_2022_GGLNG",
  "LNG_PORTFOLIO_2022_SG",
  "LNG_PORTFOLIO_2023_GGLNG",
  "LNG_PORTFOLIO_2023_SG",
  "LNG_PORTFOLIO_2024_GGLNG",
  "LNG_PORTFOLIO_2024_SG",
  "LNG_PORTFOLIO_2025_SG",
  "LNG_PORTFOLIO_2025_SLNG",
  "LNG_SWAPS_GAS_UK",
  "LPG_PROFITSHARE_SG",
  "LPG_PROFITSHARE_UK",
  "MANAGEMENT_EP_UK",
  "MANAGEMENT_FX_X-DESK_UK",
  "MANAGEMENT_GAIL_DOP_2023_SG",
  "MANAGEMENT_GPE_GAS_UK",
  "MANAGEMENT_LNG_GGLNG",
  "MANAGEMENT_LNG_SG",
  "MANAGEMENT_X-DESK_UK",
  "MGMT_LNG_MARKET_ACCESS_GGLNG",
  "MGMT_LNG_MARKET_ACCESS_SG",
  "MGMT_RESERVES_GAS_UK",
  "MID_DISTILLATES_CH",
  "MIDWEST_GAS_US",
  "MODEL_TRADING_PWR_UK",
  "MULTI_CROSS_COMM_PWR_UK",
  "NAFTA_A_STOR_GAS_UK",
  "NAFTA_CHRIS_STOR_GAS_UK",
  "NAFTA_CROSS_STOR_GAS_UK",
  "NAFTA_HEDGE_2_STOR_GAS_UK",
  "NAPHTHA_CH",
  "NAPHTHA_PHY_HEDGE_SG",
  "NAPHTHA_SPEC_SG",
  "NBP_PS_STOR_GAS_UK",
  "NCG_B_STOR_GAS_UK",
  "NCG_PS_STOR_GAS_UK",
  "NCG_S_STOR_GAS_UK",
  "NCG_STOR_GAS_UK",
  "NCG_WD_BAL_STOR_GAS_UK",
  "NCGGPL_B_STOR_GAS_UK",
  "NL_RE_FIXED_GAS_UK",
  "OIL_2020_LNG_SG",
  "Oil_2021_LNG_SG",
  "OIL_2022_LNG_SG",
  "OIL_2023_LNG_SG",
  "OIL_DERIVATIVES_GAS_UK",
  "OIL_SPREADS_GAS_UK",
  "OIL_SPREADS2_GAS_UK",
  "OIL_SPREADS3_GAS_UK",
  "OPEN_2_STOR_GAS_UK",
  "OPEN_3_STOR_GAS_UK",
  "OS_PORT_FIXED_3_GAS_UK",
  "OS_PORT_FIXED_4_GAS_UK",
  "OS_PORTFOLIO_1_GAS_UK",
  "OS_PORTFOLIO_2_GAS_UK",
  "OS_PORTFOLIO_3_GAS_UK",
  "OS_PORTFOLIO_4_GAS_UK",
  "OS_SWING_GAS_UK",
  "OUTRIGHT_FX_SG",
  "OUTRIGHT_LPG_SG",
  "OUTRIGHT_LPGSPEC_SG",
  "OUTRIGHT_OIL_SG",
  "PEAKER_OPT_PWR_UK",
  "PEGN_S_SWAP_STOR_GAS_UK",
  "PEGNORD_B_MAN_STOR_GAS_UK",
  "PEGNORD_B_STOR_GAS_UK",
  "PEGSUD_B_STOR_GAS_UK",
  "PHYS_HEDGING_OIL_UK",
  "PHYSICAL_GAS_US",
  "PHYSICAL_LPG_SG",
  "PORT_BALANCING_GAS_UK",
  "PORT_BASIS_GAS_UK",
  "PORT_BUNDLE_HEDGE_GAS_UK",
  "PORT_BUNDLE_PROXY_GAS_UK",
  "PORT_BUNDLE_STOR_GAS_UK",
  "PORT_CAPACITY_GAS_UK",
  "PORT_EQUITY_STOR_GAS_UK",
  "PORT_EUROHEDGE_GAS_UK",
  "PORT_GAS_UK",
  "PORT_GPE_GAS_UK",
  "PORT_LOGISTICS_GAS_UK",
  "PORT_MARKET_ROUTE_GAS_UK",
  "PORT_NAFTA_GAS_UK",
  "PORT_OIL_GAS_UK",
  "PORT_OPTIMISATION_GAS_UK",
  "PORT_SPB_GAS_UK",
  "PORT_STOR_GAS_UK",
  "PORT_TRANSPORT_GAS_UK",
  "PORT_WINGAS_PS_GAS_UK",
  "PORTFOLIO_GAS_CH",
  "PORTFOLIO_OIL_UK",
  "PORTFOLIO_OPTIONS_GAS_UK",
  "POWER_FLOW_OPTIONS_GAS_UK",
  "POWER_OPTIONS_PWR_UK",
  "PP_MANAGEMENT_GAS_UK",
  "PRIME_EMGEN_PWR_UK",
  "PROP_11_GAS_UK",
  "PROP_14_GAS_UK",
  "PROP_FX_US",
  "PROP_OPTIONS_2_GAS_UK",
  "PROP_OPTIONS_3_GAS_UK",
  "PROXY_SWING_GAS_UK",
  "PSV_STOR_GAS_UK",
  "QUANT_FX_GAS_UK",
  "RE_MR1_GAS_UK",
  "RE_TF1_GAS_UK",
  "RE_TF2_GAS_UK",
  "REGAS_DET_2024_GAS_UK",
  "REGAS_FR_2021_GAS_UK",
  "REGAS_FR_GAS_UK",
  "REGAS_SPAIN_2024_GAS_UK",
  "ROUGH_STOR_GAS_UK",
  "SEE_StratOrig_GAS_UK",
  "SHORT_TERM_DE_PWR_UK",
  "SHORT_TERM_HU_PWR_UK",
  "SK_HU_PWR_UK",
  "SOUTH_EAST_EUROPE_PWR_UK",
  "SP_TRANS_GAS_UK",
  "SPEC_OIL_ADI_UK",
  "SPEC_OIL_ANDREW_UK",
  "SPEC_OIL_BEN_UK",
  "SPEC_OIL_GILLIAN_UK",
  "SPEC_OIL_UK",
  "SPEC_OIL_UK2",
  "SPEC_OPTIONS_PWR_UK",
  "SPREADS_RV1_OIL_UK",
  "STRUC_OIL_SG",
  "STRUC_OIL_UK",
  "STRUC_OPTIONS_GAS_UK",
  "STRUC_OPTIONS_OIL_SG",
  "STRUC_OPTIONS_OIL_UK",
  "STRUCTURED_SPARKS_PWR_UK",
  "TAQA_OPT_GAS_UK",
  "TEMP_FLEX_GAS_UK",
  "TOLLING_PWR_UK",
  "TRANS_TRSY_HDG_FX_UK",
  "TRS_B_STOR_GAS_UK",
  "TRS_RE_STOR_GAS_UK",
  "TRSY_HDG_FX_US",
  "TTF_B_STOR_GAS_UK",
  "TTF_EWEG_PS_STOR_GAS_UK",
  "TTF_PS_STOR_GAS_UK",
  "TTF_S_3_STOR_GAS_UK",
  "TTF_S_STOR_GAS_UK",
  "TTF_S_STORSWING_GAS_UK",
  "TTF_WD_BAL_STOR_GAS_UK",
  "TTFNCG_B_STOR_GAS_UK",
  "UK_CURVE_PWR_UK",
  "UK_DIRTY_SPARKS_PWR_UK",
  "UK_EMGEN_AGR_PEAKER_PWR",
  "UK_EMGEN_ALLEN_PWR_UK",
  "UK_EMGEN_AMP_PEAKER_PWR_UK",
  "UK_EMGEN_AMY_PWR_UK",
  "UK_EMGEN_AREVON_LFG_PWR_UK",
  "UK_EMGEN_BENEFITS_PWR_UK",
  "UK_EMGEN_BUXTON_PWR_UK",
  "UK_EMGEN_BYGEN_PEAKER_PWR_UK",
  "UK_EMGEN_CANADIAN_SOL_PWR_UK",
  "UK_EMGEN_CASWELL_PWR_UK",
  "UK_EMGEN_CAVENDISH_PWR_UK",
  "UK_EMGEN_CHESTERFIELD_PWR_UK",
  "UK_EMGEN_COPSE_PEAKER_PWR_UK",
  "UK_EMGEN_CROUCHLAND_AD",
  "UK_EMGEN_ELMS_PEAKER_PWR",
  "UK_EMGEN_ENCAVIS_PWR_UK",
  "UK_EMGEN_FINWAY_PEAKER",
  "UK_EMGEN_HALL_FARM_PEAKER",
  "UK_EMGEN_INF_HEM_HEATH_PWR_UK",
  "UK_EMGEN_INF_STAVELEY_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_B_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_C_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_D_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_E_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_F_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_G_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_H_PWR_UK",
  "UK_EMGEN_INFINIS_GAS_PWR_UK",
  "UK_EMGEN_INFINIS_PEAKER",
  "UK_EMGEN_INFINIS_PROPANE",
  "UK_EMGEN_INTRADAY_PWR_UK",
  "UK_EMGEN_KLL_HYDRO_PWR_UK",
  "UK_EMGEN_LILLYHALL_PWR_UK",
  "UK_EMGEN_NEWTON_PWR_UK",
  "UK_EMGEN_PYEBRIDGE_PEAKER",
  "UK_EMGEN_QUINBROOK_PWR_UK",
  "UK_EMGEN_REDDITCH_PWR_UK",
  "UK_EMGEN_STATERA_PEAKER_PWR_UK",
  "UK_EMGEN_UKPR_PEAKER_PWR_UK",
  "UK_EMGEN_VENTURE_PWR_UK",
  "UK_EMGEN_WALKER_BAL_PWR_UK",
  "UK_EMGEN_WALKER_CAR_PEAKER_PWR",
  "UK_EMGEN_WALKER_PEAKER",
  "UK_EMGEN_WATERS_PWR_UK",
  "UK_GAS_FLEX_GAS_UK",
  "UK_GAS_FLEX_INDEX_GAS_UK",
  "UK_RE_ARMAD_GAS_UK",
  "UK_RE_FIXED_GAS_UK",
  "UK_RETAIL_PROP_1",
  "UK_STRUCTURED_FLOW_PWR_UK",
  "USGAS_2022_GGLNG",
  "USGAS_2023_GGLNG",
  "VIRTUAL_TRAN_GAS_UK",
  "VTP_PS_2_STOR_GAS_UK",
  "VTP_PS_2A_STOR_GAS_UK",
  "WIN_PS_STOR_GAS_UK",
  "YARA_RE_GAS_UK",
  "ZTP_B_STOR_GAS_UK",
  "ZTP_WD_BAL_STOR_GAS_UK",
  "REGAS_SPAIN_2025_GAS_UK",
  "UNIPER_ET_GAS_UK",
  "PORT_BAL_GAS_UK",
  "VTP_PS_3_STOR_GAS_UK",
  "VTP_PS_STOR_GAS_UK",
  "NBP_2_STOR_GAS_UK",
  "UER_VAL_VER_EP_UK",
  "PROJECTS_EP_UK",
  "SOCAR_BASE_SMT",
  "METAL_DESK_PS_SMT",
  "METAL_DESK_PS_SMTS",
];

export const mockBooks: Book[] = bookData.map((book, index) => ({
  id: String(index + 1),
  name: book.name,
  desk: book.desk,
  primaryTrader: book.primaryTrader,
  secondaryTrader: book.secondaryTrader,
  deskHead: book.deskHead,
  productController: book.productController,
  isRetired: retiredBookNames.includes(book.name),
  signOffs: generateRandomSignOffs(),
  comments: generateSampleComments(String(index + 1), book.name, book.primaryTrader, book.deskHead),
}));

// Extract unique product controllers from book data
const productControllers = [...new Set(bookData.map(b => b.productController))];
const traders = [...new Set([...bookData.map(b => b.primaryTrader), ...bookData.map(b => b.secondaryTrader)])];
const deskHeads = [...new Set(bookData.map(b => b.deskHead))];

export const mockUsers: User[] = [
  ...productControllers.map((name, i) => ({
    id: `pc-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@sefe.eu`,
    role: 'product_controller' as const,
  })),
  ...traders.slice(0, 10).map((name, i) => ({
    id: `tr-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@sefe.eu`,
    role: 'trader' as const,
  })),
  ...deskHeads.slice(0, 5).map((name, i) => ({
    id: `dh-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@sefe.eu`,
    role: 'desk_head' as const,
  })),
];

export const currentUser: User = mockUsers[0]; // First Product Controller

export const desks = [...new Set(bookData.map(b => b.desk))].sort();
