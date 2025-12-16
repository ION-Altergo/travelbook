"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';
import { Availability, AVAILABILITY_CONFIG, AvailabilityStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AvailabilitySidebarProps {
  availability: Availability | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (availability: Availability) => void;
  onDelete: (availabilityId: string) => void;
}

export function AvailabilitySidebar({ 
  availability, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: AvailabilitySidebarProps) {
  const [formData, setFormData] = useState<Availability | null>(availability);

  useEffect(() => {
    setFormData(availability);
  }, [availability]);

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (formData && confirm('Are you sure you want to delete this availability period?')) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l shadow-lg z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Edit Availability</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AvailabilityStatus) => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
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
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate 
                      ? format(new Date(formData.startDate), 'PPP') 
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => date && setFormData({ 
                      ...formData, 
                      startDate: date 
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate 
                      ? format(new Date(formData.endDate), 'PPP') 
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => date && setFormData({ 
                      ...formData, 
                      endDate: date 
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Family vacation, training period..."
              />
            </div>

            {/* Status Preview */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: AVAILABILITY_CONFIG[formData.status].color }}
                />
                <div>
                  <div className="font-medium">
                    {AVAILABILITY_CONFIG[formData.status].label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formData.startDate && formData.endDate && (
                      <>
                        {format(new Date(formData.startDate), 'MMM d')} - {format(new Date(formData.endDate), 'MMM d, yyyy')}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Period
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

