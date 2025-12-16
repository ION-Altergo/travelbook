"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { getTripDuration, getEngineerById, getExpensesByTrip } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Trip } from '@/types';
import { TripSidebar } from '@/components/trip-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TripsPage() {
  const { engineers, trips, addTrip, updateTrip, deleteTrip, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Find engineer matching current user
  const currentEngineer = engineers.find(e => e.email === currentUser?.email);

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = 
      trip.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesEngineer = engineerFilter === 'all' || trip.engineerId === engineerFilter;

    return matchesSearch && matchesStatus && matchesEngineer;
  });

  const statusColors = {
    planned: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'in-progress': 'bg-green-100 text-green-700 hover:bg-green-200',
    completed: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    cancelled: 'bg-red-100 text-red-600 hover:bg-red-200',
  };

  const handleAddTrip = () => {
    // Create a default trip with current user as engineer
    const defaultTrip: Omit<Trip, 'id'> = {
      engineerId: currentEngineer?.id || engineers[0]?.id || '',
      projectName: 'New Trip',
      location: 'Location',
      startDate: new Date(),
      endDate: new Date(),
      status: 'planned',
      notes: '',
    };
    
    // Add it and get the ID
    const newTripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTrip: Trip = { ...defaultTrip, id: newTripId };
    
    addTrip(defaultTrip);
    
    // Open sidebar with the new trip
    setSelectedTrip(newTrip);
    setIsSidebarOpen(true);
  };

  const handleRowClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsSidebarOpen(true);
  };

  const handleSave = (updatedTrip: Trip) => {
    updateTrip(updatedTrip.id, updatedTrip);
  };

  const handleDelete = (tripId: string) => {
    deleteTrip(tripId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">
            Manage on-site engineering trips
          </p>
        </div>
        <Button onClick={handleAddTrip}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trip
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Team Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {engineers.map((engineer) => (
              <SelectItem key={engineer.id} value={engineer.id}>
                {engineer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Team Member</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No trips found. Click "Add Trip" to create one.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrips.map((trip) => {
                const engineer = getEngineerById(trip.engineerId);
                const duration = getTripDuration(trip);

                return (
                  <TableRow
                    key={trip.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(trip)}
                  >
                    <TableCell className="font-medium">{trip.projectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: engineer?.color }}
                        />
                        <span className="text-sm">{engineer?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{trip.location}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(trip.startDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{duration} days</TableCell>
                    <TableCell>
                      <Badge className={statusColors[trip.status]}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sidebar */}
      <TripSidebar
        trip={selectedTrip}
        engineers={engineers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
