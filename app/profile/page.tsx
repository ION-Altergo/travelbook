"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, User, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import { Availability, AVAILABILITY_CONFIG } from '@/types';
import { AvailabilitySidebar } from '@/components/availability-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProfilePage() {
  const { currentUser, engineers, availabilities, addAvailability, updateAvailability, deleteAvailability } = useData();
  const currentEngineer = engineers.find(e => e.email === currentUser?.email);
  
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter availabilities for current user
  const userAvailabilities = currentEngineer 
    ? availabilities
        .filter(a => a.engineerId === currentEngineer.id)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    : [];

  const handleAddAvailability = () => {
    if (!currentEngineer) return;

    // Create a default availability
    const defaultAvailability: Omit<Availability, 'id'> = {
      engineerId: currentEngineer.id,
      status: 'available',
      startDate: new Date(),
      endDate: new Date(),
      notes: '',
    };
    
    // Add it and get the ID
    const newAvailabilityId = `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAvailability: Availability = { ...defaultAvailability, id: newAvailabilityId };
    
    addAvailability(defaultAvailability);
    
    // Open sidebar with the new availability
    setSelectedAvailability(newAvailability);
    setIsSidebarOpen(true);
  };

  const handleRowClick = (availability: Availability) => {
    setSelectedAvailability(availability);
    setIsSidebarOpen(true);
  };

  const handleSave = (updatedAvailability: Availability) => {
    updateAvailability(updatedAvailability.id, updatedAvailability);
  };

  const handleDelete = (availabilityId: string) => {
    deleteAvailability(availabilityId);
    setIsSidebarOpen(false);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(availabilityId);
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(userAvailabilities.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (availabilityId: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(availabilityId);
      } else {
        newSet.delete(availabilityId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.size} availability period(s)?`)) {
      selectedIds.forEach(id => deleteAvailability(id));
      setSelectedIds(new Set());
    }
  };

  if (!currentUser || !currentEngineer) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to manage your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your availability and travel status
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{currentUser.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{currentUser.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium">{currentEngineer.role}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Team Color</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: currentEngineer.color }}
                />
                <p className="font-medium">{currentEngineer.color}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Availability Status</CardTitle>
              <CardDescription>
                Set your availability periods to let your team know when you can travel
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedIds.size})
                </Button>
              )}
              <Button onClick={handleAddAvailability}>
                <Plus className="mr-2 h-4 w-4" />
                Add Period
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Legend */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Status Types</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-medium">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Table */}
          {userAvailabilities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
              <p className="mb-2">No availability periods set</p>
              <p className="text-sm">Add one to let your team know your status</p>
            </div>
          ) : (
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.size === userAvailabilities.length && userAvailabilities.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAvailabilities.map((availability) => {
                    const config = AVAILABILITY_CONFIG[availability.status];
                    const startDate = new Date(availability.startDate);
                    const endDate = new Date(availability.endDate);
                    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return (
                      <TableRow 
                        key={availability.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(availability.id)}
                            onCheckedChange={(checked) => handleSelectOne(availability.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell 
                          className="cursor-pointer"
                          onClick={() => handleRowClick(availability)}
                        >
                          <Badge 
                            style={{ 
                              backgroundColor: `${config.color}20`,
                              color: config.color,
                              borderColor: config.color
                            }}
                            className="border"
                          >
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="text-sm cursor-pointer"
                          onClick={() => handleRowClick(availability)}
                        >
                          {format(startDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell 
                          className="text-sm cursor-pointer"
                          onClick={() => handleRowClick(availability)}
                        >
                          {format(endDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell 
                          className="text-sm cursor-pointer"
                          onClick={() => handleRowClick(availability)}
                        >
                          {durationDays} {durationDays === 1 ? 'day' : 'days'}
                        </TableCell>
                        <TableCell 
                          className="text-sm text-muted-foreground cursor-pointer max-w-[200px] truncate"
                          onClick={() => handleRowClick(availability)}
                        >
                          {availability.notes || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Sidebar */}
      <AvailabilitySidebar
        availability={selectedAvailability}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 hidden md:block"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
