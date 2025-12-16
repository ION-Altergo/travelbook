export interface Engineer {
  id: string;
  name: string;
  email: string;
  role: string;
  dailyRate: number; // in euros
  color: string; // for visual identification in timeline
}

export interface Trip {
  id: string;
  engineerId: string;
  projectName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  engineerId: string;
  type: 'travel' | 'accommodation' | 'meals' | 'transportation' | 'other';
  amount: number; // in euros
  currency: string;
  date: Date;
  description: string;
  receipt?: string; // URL to receipt image
}

export interface Report {
  id: string;
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  engineers: string[]; // engineer IDs
  totalDays: number;
  totalCost: number;
  expenses: Expense[];
  generatedAt: Date;
}

export interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  totalEngineers: number;
  totalExpenses: number;
  upcomingTrips: number;
}

export type AvailabilityStatus = 
  | 'available'
  | 'on-break'
  | 'flexible'
  | 'cannot-travel'
  | 'limited-availability';

export interface Availability {
  id: string;
  engineerId: string;
  status: AvailabilityStatus;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; color: string; bgColor: string }> = {
  'available': {
    label: 'Available',
    color: '#10b981',
    bgColor: 'bg-green-100/50',
  },
  'on-break': {
    label: 'On Break',
    color: '#ef4444',
    bgColor: 'bg-red-100/50',
  },
  'flexible': {
    label: 'Flexible for Travel',
    color: '#3b82f6',
    bgColor: 'bg-blue-100/50',
  },
  'cannot-travel': {
    label: 'Cannot Travel',
    color: '#dc2626',
    bgColor: 'bg-red-200/50',
  },
  'limited-availability': {
    label: 'Limited Availability',
    color: '#f59e0b',
    bgColor: 'bg-amber-100/50',
  },
};

