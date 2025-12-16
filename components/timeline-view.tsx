"use client";

import { useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  startOfMonth, 
  endOfMonth, 
  startOfQuarter,
  endOfQuarter,
  isSameDay 
} from 'date-fns';
import { Trip, Engineer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  trips: Trip[];
  engineers: Engineer[];
  currentDate?: Date;
  viewType?: 'week' | 'month' | 'quarter';
}

export function TimelineView({ 
  trips, 
  engineers, 
  currentDate = new Date(),
  viewType = 'month' 
}: TimelineViewProps) {
  // Generate days based on view type
  const { periodStart, periodEnd, days, periodLabel } = useMemo(() => {
    let start: Date;
    let end: Date;
    let label: string;

    if (viewType === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
      label = `Week of ${format(start, 'MMM d, yyyy')}`;
    } else if (viewType === 'month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
      label = format(currentDate, 'MMMM yyyy');
    } else {
      start = startOfQuarter(currentDate);
      end = endOfQuarter(currentDate);
      label = `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${format(currentDate, 'yyyy')}`;
    }

    const daysArray = eachDayOfInterval({ start, end });

    return {
      periodStart: start,
      periodEnd: end,
      days: daysArray,
      periodLabel: label,
    };
  }, [currentDate, viewType]);

  // Calculate trip positions
  const tripPositions = useMemo(() => {
    return trips.map(trip => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      const engineer = engineers.find(e => e.id === trip.engineerId);

      // Find start and end column indices
      let startCol = -1;
      let endCol = -1;

      days.forEach((day, index) => {
        if (isSameDay(day, tripStart)) startCol = index;
        if (isSameDay(day, tripEnd)) endCol = index;
        
        // If trip starts before period
        if (tripStart < periodStart && index === 0) startCol = 0;
        // If trip ends after period
        if (tripEnd > periodEnd && index === days.length - 1) endCol = days.length - 1;
      });

      // Check if trip overlaps with current period
      const overlaps = (tripStart <= periodEnd && tripEnd >= periodStart);

      return {
        trip,
        engineer,
        startCol,
        endCol,
        overlaps,
      };
    }).filter(t => t.overlaps && t.startCol >= 0);
  }, [trips, engineers, days, periodStart, periodEnd]);

  const statusColors = {
    planned: 'bg-slate-200 text-slate-700 border-slate-300',
    confirmed: 'bg-blue-200 text-blue-700 border-blue-300',
    'in-progress': 'bg-green-200 text-green-700 border-green-300',
    completed: 'bg-gray-100 text-gray-500 border-gray-200',
    cancelled: 'bg-red-100 text-red-500 border-red-200',
  };

  // Date format based on view type
  const dateFormat = viewType === 'week' ? 'd' : viewType === 'month' ? 'd' : 'MMM d';
  const dayFormat = viewType === 'quarter' ? 'MMM d' : 'EEE';

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with dates */}
        <div className="grid grid-cols-[200px_1fr] gap-4 mb-2">
          <div className="text-sm font-medium text-muted-foreground px-4">
            {periodLabel}
          </div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
            {days.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              const showDate = viewType === 'quarter' 
                ? index % 7 === 0 // Show date every 7 days for quarter view
                : true;

              return (
                <div
                  key={index}
                  className={cn(
                    "text-xs text-center py-2",
                    isToday ? "bg-primary/10 font-semibold" : "text-muted-foreground",
                    !showDate && "opacity-50"
                  )}
                >
                  {showDate && (
                    <>
                      <div>{format(day, dateFormat)}</div>
                      <div className="text-[10px]">{format(day, dayFormat)}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline rows */}
        <div className="space-y-2">
          {engineers.map((engineer) => {
            const engineerTrips = tripPositions.filter(t => t.engineer?.id === engineer.id);
            
            return (
              <div key={engineer.id} className="grid grid-cols-[200px_1fr] gap-4">
                {/* Engineer info */}
                <div className="flex items-center space-x-3 px-4 py-2 border rounded-lg bg-card">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: engineer.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{engineer.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{engineer.role}</div>
                  </div>
                </div>

                {/* Timeline grid */}
                <div className="relative border rounded-lg" style={{ height: '60px' }}>
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                  >
                    {days.map((day, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "border-r last:border-r-0 border-border/40",
                          isSameDay(day, new Date()) && "bg-primary/5"
                        )} 
                      />
                    ))}
                  </div>

                  {/* Trip bars */}
                  {engineerTrips.map(({ trip, startCol, endCol }) => {
                    const width = ((endCol - startCol + 1) / days.length) * 100;
                    const left = (startCol / days.length) * 100;

                    return (
                      <div
                        key={trip.id}
                        className={cn(
                          "absolute top-2 h-10 rounded px-2 py-1 text-xs font-medium border-2 cursor-pointer transition-all hover:shadow-md hover:z-10",
                          statusColors[trip.status]
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                        title={`${trip.projectName} - ${trip.location}\n${format(new Date(trip.startDate), 'MMM d')} - ${format(new Date(trip.endDate), 'MMM d, yyyy')}`}
                      >
                        <div className="truncate font-semibold">{trip.projectName}</div>
                        <div className="truncate text-[10px] opacity-80">{trip.location}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs">
          <span className="text-muted-foreground font-medium">Status:</span>
          {Object.entries(statusColors).map(([status, colorClass]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded", colorClass)} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
