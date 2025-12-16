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

