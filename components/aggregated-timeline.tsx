"use client";

import { useMemo } from 'react';
import { 
  format, 
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  startOfWeek, 
  endOfWeek,
  startOfMonth, 
  endOfMonth, 
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subYears,
  addYears,
  isSameDay,
  eachDayOfInterval,
  isWithinInterval
} from 'date-fns';
import { Trip, Engineer, Availability, AVAILABILITY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface AggregatedTimelineProps {
  trips: Trip[];
  engineers: Engineer[];
  availabilities: Availability[];
  currentDate?: Date;
  aggregationType?: 'week' | 'month' | 'quarter' | 'year';
}

export function AggregatedTimeline({ 
  trips, 
  engineers,
  availabilities,
  currentDate = new Date(),
  aggregationType = 'month' 
}: AggregatedTimelineProps) {
  
  // Generate periods based on aggregation type
  const periods = useMemo(() => {
    if (aggregationType === 'year') {
      // Show 5 years: 2 before, current, 2 after
      const startYear = subYears(currentDate, 2);
      const endYear = addYears(currentDate, 2);
      return eachYearOfInterval({ start: startOfYear(startYear), end: endOfYear(endYear) });
    }
    
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);

    if (aggregationType === 'week') {
      return eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 });
    } else if (aggregationType === 'month') {
      return eachMonthOfInterval({ start: yearStart, end: yearEnd });
    } else {
      return eachQuarterOfInterval({ start: yearStart, end: yearEnd });
    }
  }, [currentDate, aggregationType]);

  // Calculate days per engineer per period
  const engineerData = useMemo(() => {
    return engineers.map(engineer => {
      const engineerTrips = trips.filter(t => t.engineerId === engineer.id);
      
      const periodDays = periods.map(periodStart => {
        let periodEnd: Date;
        
        if (aggregationType === 'week') {
          periodEnd = endOfWeek(periodStart, { weekStartsOn: 1 });
        } else if (aggregationType === 'month') {
          periodEnd = endOfMonth(periodStart);
        } else if (aggregationType === 'quarter') {
          periodEnd = endOfQuarter(periodStart);
        } else {
          periodEnd = endOfYear(periodStart);
        }

        // Count days in this period
        let daysInPeriod = 0;
        
        engineerTrips.forEach(trip => {
          const tripStart = new Date(trip.startDate);
          const tripEnd = new Date(trip.endDate);
          
          // Check if trip overlaps with period
          if (tripStart <= periodEnd && tripEnd >= periodStart) {
            const overlapStart = tripStart > periodStart ? tripStart : periodStart;
            const overlapEnd = tripEnd < periodEnd ? tripEnd : periodEnd;
            
            const daysInOverlap = eachDayOfInterval({ start: overlapStart, end: overlapEnd });
            daysInPeriod += daysInOverlap.length;
          }
        });

        return {
          periodStart,
          periodEnd,
          days: daysInPeriod,
        };
      });

      return {
        engineer,
        periodDays,
      };
    });
  }, [engineers, trips, periods, aggregationType]);

  // Format period label
  const getPeriodLabel = (periodStart: Date) => {
    if (aggregationType === 'week') {
      return format(periodStart, 'MMM d');
    } else if (aggregationType === 'month') {
      return format(periodStart, 'MMM');
    } else if (aggregationType === 'quarter') {
      return `Q${Math.floor(periodStart.getMonth() / 3) + 1}`;
    } else {
      return format(periodStart, 'yyyy');
    }
  };

  // Check if period contains today
  const isCurrentPeriod = (periodStart: Date, periodEnd: Date) => {
    const today = new Date();
    return isWithinInterval(today, { start: periodStart, end: periodEnd });
  };

  // Get availability status for engineer in period
  const getAvailabilityStatus = (engineerId: string, periodStart: Date, periodEnd: Date) => {
    const engineerAvails = availabilities.filter(a => a.engineerId === engineerId);
    
    // Find any availability that overlaps with this period
    for (const avail of engineerAvails) {
      const availStart = new Date(avail.startDate);
      const availEnd = new Date(avail.endDate);
      
      // Check for overlap
      if (availStart <= periodEnd && availEnd >= periodStart) {
        return avail.status;
      }
    }
    
    return null;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with period labels */}
        <div className="grid grid-cols-[200px_1fr] gap-0 mb-1">
          <div className="text-sm font-medium text-muted-foreground px-4 border-r">
            {aggregationType === 'year' 
              ? 'Multi-Year View' 
              : format(currentDate, 'yyyy')}
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${periods.length}, 1fr)` }}>
            {periods.map((period, index) => {
              const periodEnd = aggregationType === 'week' 
                ? endOfWeek(period, { weekStartsOn: 1 })
                : aggregationType === 'month'
                ? endOfMonth(period)
                : aggregationType === 'quarter'
                ? endOfQuarter(period)
                : endOfYear(period);
              
              const isCurrent = isCurrentPeriod(period, periodEnd);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "text-xs text-center py-2 border-r border-t border-b",
                    isCurrent ? "bg-primary/10 font-semibold" : "bg-muted/20"
                  )}
                >
                  {getPeriodLabel(period)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline rows */}
        <div className="space-y-0">
          {engineerData.map(({ engineer, periodDays }) => (
            <div key={engineer.id} className="grid grid-cols-[200px_1fr] gap-0">
              {/* Engineer info */}
              <div className="flex items-center space-x-3 px-4 py-3 border-r border-b bg-card">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: engineer.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{engineer.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{engineer.role}</div>
                </div>
              </div>

              {/* Period boxes */}
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${periods.length}, 1fr)` }}>
                {periodDays.map((period, index) => {
                  const isCurrent = isCurrentPeriod(period.periodStart, period.periodEnd);
                  const availStatus = getAvailabilityStatus(engineer.id, period.periodStart, period.periodEnd);
                  const availConfig = availStatus ? AVAILABILITY_CONFIG[availStatus] : null;
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-b py-3 transition-colors min-h-[60px] relative",
                        period.days > 0 
                          ? "hover:bg-accent/50 cursor-pointer" 
                          : "",
                        isCurrent && "bg-primary/5"
                      )}
                      style={{
                        backgroundColor: availStatus 
                          ? availConfig?.color + '15'
                          : period.days > 0 
                            ? `${engineer.color}10` 
                            : undefined,
                      }}
                      title={`${engineer.name}: ${period.days} days\n${format(period.periodStart, 'MMM d')} - ${format(period.periodEnd, 'MMM d, yyyy')}${availStatus ? `\nStatus: ${availConfig?.label}` : ''}`}
                    >
                      {/* Availability indicator */}
                      {availStatus && (
                        <div
                          className="absolute top-1 right-1 w-2 h-2 rounded-full"
                          style={{ backgroundColor: availConfig?.color }}
                          title={availConfig?.label}
                        />
                      )}
                      
                      {period.days > 0 && (
                        <>
                          <div className="text-xl font-bold" style={{ color: engineer.color }}>
                            {period.days}
                          </div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">
                            {period.days === 1 ? 'day' : 'days'}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-[200px_1fr] gap-0 border-t-2">
          <div className="flex items-center px-4 py-3 text-sm font-semibold border-r bg-muted/30">
            Total Days
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${periods.length}, 1fr)` }}>
            {periods.map((period, index) => {
              const totalDays = engineerData.reduce((sum, { periodDays }) => 
                sum + periodDays[index].days, 0
              );
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-center border-r py-3 bg-muted/30",
                    totalDays > 0 ? "font-semibold" : ""
                  )}
                >
                  {totalDays > 0 && (
                    <span className="text-base">{totalDays}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

