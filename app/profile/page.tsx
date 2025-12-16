"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon, Trash2, User } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import { Availability, AVAILABILITY_CONFIG, AvailabilityStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { currentUser, engineers, availabilities, addAvailability, deleteAvailability } = useData();
  const currentEngineer = engineers.find(e => e.email === currentUser?.email);

  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState<AvailabilityStatus>('available');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');

  // Filter availabilities for current user
  const userAvailabilities = currentEngineer 
    ? availabilities.filter(a => a.engineerId === currentEngineer.id)
    : [];

  const handleAdd = () => {
    if (!currentEngineer || !startDate || !endDate) return;

    addAvailability({
      engineerId: currentEngineer.id,
      status,
      startDate,
      endDate,
      notes,
    });

    // Reset form
    setStatus('available');
    setStartDate(new Date());
    setEndDate(new Date());
    setNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this availability period?')) {
      deleteAvailability(id);
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
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Period
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Form */}
          {isAdding && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value: AvailabilityStatus) => setStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: config.color }}
                              />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Notes (Optional)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Family vacation, training period..."
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAdd}>
                    Add Availability Period
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAdding(false);
                    setNotes('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Availability List */}
          {userAvailabilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No availability periods set. Add one to let your team know your status.
            </div>
          ) : (
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAvailabilities
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map((availability) => {
                      const config = AVAILABILITY_CONFIG[availability.status];
                      return (
                        <TableRow key={availability.id}>
                          <TableCell>
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
                          <TableCell className="text-sm">
                            {format(new Date(availability.startDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(availability.endDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {availability.notes || '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(availability.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
    </div>
  );
}

