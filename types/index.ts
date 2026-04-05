import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  activeDataKey?: string;
  displayName: string;
  taxRate: number;
  isVatRegistered?: boolean;
  yelIncomeLevel?: number;
  weeklyGoal?: number;
  totalGross: number;
  totalDistance?: number;
  showPeakAlerts?: boolean;
  homeLocation?: { lat: number; lng: number };
  maintenance?: { 
    lastKm: number; 
    interval: number; 
    vehicleType: string;
    nextOilChange?: number;
    nextTireSwap?: string;
    tires?: {
      front: number;
      rear: number;
      lastChecked: string;
    };
  };
  maintenanceHistory?: {
    date: string;
    description: string;
    cost: number;
    km: number;
  }[];
  fuelConsumption?: number;
  fuelPrice?: number;
  subscription?: {
    status: 'active' | 'canceled' | 'past_due';
    tier: 'free' | 'pro' | 'elite';
    stripeId?: string;
    stripeCustomerId?: string;
    updatedAt?: string;
  };
  teamMembers?: string[];
}

export interface Shift {
  id?: string;
  uid?: string;
  scopeUid?: string;
  app: string;
  activeApps?: string[];
  startAddress?: string;
  endAddress?: string;
  grossPay: number;
  tips: number;
  distanceKm: number;
  fuelCost?: number;
  date: string;
  durationMin?: number;
  netProfit: number;
  taxDebt: number;
  yelCost: number;
  driverId?: string;
  driverName?: string;
  vatDebt?: number;
  deduction: number;
  gpsPoints?: { lat: number; lng: number; timestamp: string }[];
}

export interface Receipt {
  id?: string;
  uid: string;
  scopeUid?: string;
  date: string;
  merchant: string;
  amount: number;
  vat: number;
  category: string;
  description?: string;
  metadata?: any;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  locationName?: string;
}

export interface PeakPerformance {
  bestDay: string;
  bestTime: string;
  hourlyRate: number;
  platformEfficiency: { name: string; rate: number }[];
}

export interface ThresholdStatus {
  isRisk: boolean;
  message: string;
  type: 'VAT' | 'YEL' | 'NONE';
  remaining: number;
  efficiencySuggestion: string;
}

export interface VeroContextType {
  user: User | null;
  profile: UserProfile | null;
  shifts: Shift[];
  receipts: Receipt[];
  loading: boolean;
  weather: WeatherData | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  refreshData: () => void;
  clearLocalData: () => void;
  isVatRegistered: boolean;
  isOverYel: boolean;
  isApproachingYel: boolean;
  isOverVat: boolean;
  isApproachingVat: boolean;
  annualGross: number;
  totalDistance: number;
  isNightMode: boolean;
  setIsNightMode: (val: boolean) => void;
  isDrivingMode: boolean;
  setIsDrivingMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  isTracking: boolean;
  setIsTracking: (val: boolean) => void;
  trackedDistance: number;
  setTrackedDistance: (val: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  refreshWeatherAtLocation: (lat: number, lng: number) => void;
  hydrateDemoData: (payload: { profile: UserProfile; shifts: Shift[]; receipts: Receipt[] }) => void;
  setIsWipingData: (val: boolean) => void;
  currentLocation: { lat: number; lng: number } | null;
  currentGpsPoints: { lat: number; lng: number; timestamp: string }[];
  startAddress: string;
  endAddress: string;
  login: () => void;
  guestLogin: () => Promise<void>;
  logout: () => void;
  peakPerformance: PeakPerformance | null;
  isOnline: boolean;
  isListening: boolean;
  toggleVoiceCommand: () => void;
  isPro: boolean;
  isElite: boolean;
  isAdmin: boolean;
  thresholdStatus: ThresholdStatus;
  subscription: UserProfile['subscription'] | null;
}
