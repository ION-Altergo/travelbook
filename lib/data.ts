import { Engineer, Trip, Expense } from '@/types';

// Sample engineers
export const engineers: Engineer[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@company.fr',
    role: 'Senior Electrical Engineer',
    dailyRate: 800,
    color: '#3b82f6', // blue
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@company.fr',
    role: 'Mechanical Engineer',
    dailyRate: 750,
    color: '#10b981', // green
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@company.fr',
    role: 'Control Systems Engineer',
    dailyRate: 820,
    color: '#f59e0b', // amber
  },
  {
    id: '4',
    name: 'Pierre Bernard',
    email: 'pierre.bernard@company.fr',
    role: 'Project Manager',
    dailyRate: 900,
    color: '#8b5cf6', // violet
  },
];

// Sample trips
export const trips: Trip[] = [
  {
    id: '1',
    engineerId: '1',
    projectName: 'Mumbai Power Plant',
    location: 'Mumbai, India',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-25'),
    status: 'completed',
    notes: 'Initial site assessment and equipment inspection',
  },
  {
    id: '2',
    engineerId: '2',
    projectName: 'Bangalore Factory',
    location: 'Bangalore, India',
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-20'),
    status: 'completed',
  },
  {
    id: '3',
    engineerId: '1',
    projectName: 'Delhi Infrastructure',
    location: 'Delhi, India',
    startDate: new Date('2024-03-05'),
    endDate: new Date('2024-03-15'),
    status: 'completed',
  },
  {
    id: '4',
    engineerId: '3',
    projectName: 'Chennai Automation',
    location: 'Chennai, India',
    startDate: new Date('2024-12-10'),
    endDate: new Date('2024-12-20'),
    status: 'confirmed',
    notes: 'Control system commissioning',
  },
  {
    id: '5',
    engineerId: '4',
    projectName: 'Hyderabad Planning',
    location: 'Hyderabad, India',
    startDate: new Date('2025-01-08'),
    endDate: new Date('2025-01-12'),
    status: 'planned',
    notes: 'Project kickoff and planning',
  },
  {
    id: '6',
    engineerId: '2',
    projectName: 'Pune Installation',
    location: 'Pune, India',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-28'),
    status: 'planned',
  },
];

// Sample expenses
export const expenses: Expense[] = [
  {
    id: '1',
    tripId: '1',
    engineerId: '1',
    type: 'travel',
    amount: 1200,
    currency: 'EUR',
    date: new Date('2024-01-15'),
    description: 'Paris to Mumbai flight (round trip)',
  },
  {
    id: '2',
    tripId: '1',
    engineerId: '1',
    type: 'accommodation',
    amount: 1500,
    currency: 'EUR',
    date: new Date('2024-01-15'),
    description: 'Hotel Mumbai - 10 nights',
  },
  {
    id: '3',
    tripId: '1',
    engineerId: '1',
    type: 'meals',
    amount: 450,
    currency: 'EUR',
    date: new Date('2024-01-15'),
    description: 'Per diem meals',
  },
  {
    id: '4',
    tripId: '2',
    engineerId: '2',
    type: 'travel',
    amount: 1150,
    currency: 'EUR',
    date: new Date('2024-02-10'),
    description: 'Paris to Bangalore flight',
  },
  {
    id: '5',
    tripId: '2',
    engineerId: '2',
    type: 'accommodation',
    amount: 1200,
    currency: 'EUR',
    date: new Date('2024-02-10'),
    description: 'Hotel Bangalore - 10 nights',
  },
];

// Helper functions
export function getTripDuration(trip: Trip): number {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
  return diffDays;
}

export function getEngineerById(id: string): Engineer | undefined {
  return engineers.find(e => e.id === id);
}

export function getTripsByEngineer(engineerId: string): Trip[] {
  return trips.filter(t => t.engineerId === engineerId);
}

export function getExpensesByTrip(tripId: string): Expense[] {
  return expenses.filter(e => e.tripId === tripId);
}

export function calculateTripCost(tripId: string): number {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return 0;
  
  const tripExpenses = getExpensesByTrip(tripId);
  const expenseTotal = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const engineer = getEngineerById(trip.engineerId);
  const duration = getTripDuration(trip);
  const laborCost = engineer ? engineer.dailyRate * duration : 0;
  
  return expenseTotal + laborCost;
}

export function calculateEngineerDaysInPeriod(
  engineerId: string,
  startDate: Date,
  endDate: Date,
  tripsArray: Trip[] = trips
): number {
  const engineerTrips = tripsArray.filter(t => t.engineerId === engineerId);
  let totalDays = 0;

  engineerTrips.forEach(trip => {
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    
    // Check if trip overlaps with the period
    if (tripStart <= endDate && tripEnd >= startDate) {
      const overlapStart = tripStart > startDate ? tripStart : startDate;
      const overlapEnd = tripEnd < endDate ? tripEnd : endDate;
      const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalDays += diffDays;
    }
  });

  return totalDays;
}

