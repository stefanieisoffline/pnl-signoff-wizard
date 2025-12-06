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

// Generate sign-offs for 10 working days to support extended date range
const workingDays = getLastWorkingDays(10);

const generateRandomSignOffs = (): SignOffRecord[] => {
  const statuses: SignOffStatus[] = ['signed', 'pending', 'rejected', 'none'];
  const weights = [0.6, 0.25, 0.1, 0.05]; // More signed than pending/rejected
  
  return workingDays.map((date) => {
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

export const mockBooks: Book[] = bookData.map((book, index) => ({
  id: String(index + 1),
  name: book.name,
  desk: book.desk,
  primaryTrader: book.primaryTrader,
  secondaryTrader: book.secondaryTrader,
  deskHead: book.deskHead,
  productController: book.productController,
  isRetired: false,
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
