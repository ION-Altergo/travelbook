"use client";

import { useState } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addQuarters, subQuarters } from 'date-fns';
import { Calendar, Users, Plane, Euro, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { TimelineView } from '@/components/timeline-view';
import { AggregatedTimeline } from '@/components/aggregated-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTripDuration, getEngineerById } from '@/lib/data';
import { useData } from '@/contexts/data-context';

type TimelineView = 'day' | 'week' | 'month' | 'quarter' | 'year';

export default function Home() {
  const { engineers, trips, expenses } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timelineView, setTimelineView] = useState<TimelineView>('month');
  const [showAggregated, setShowAggregated] = useState(true);

  // Navigation functions
  const handlePrevious = () => {
    if (timelineView === 'day') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (timelineView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (timelineView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subQuarters(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (timelineView === 'day') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (timelineView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (timelineView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addQuarters(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate stats
  const activeTrips = trips.filter(t => t.status === 'in-progress').length;
  const upcomingTrips = trips.filter(t => t.status === 'planned' || t.status === 'confirmed').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Get upcoming trips
  const sortedTrips = [...trips]
    .filter(t => new Date(t.startDate) >= new Date() || t.status === 'in-progress')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const statusColors = {
    planned: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'in-progress': 'bg-green-100 text-green-700 hover:bg-green-200',
    completed: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    cancelled: 'bg-red-100 text-red-600 hover:bg-red-200',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of engineering trips and expenses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Trips"
          value={trips.length}
          icon={Plane}
          description="All time trips"
        />
        <StatsCard
          title="Active Trips"
          value={activeTrips}
          icon={Calendar}
          description="Currently ongoing"
        />
        <StatsCard
          title="Engineers"
          value={engineers.length}
          icon={Users}
          description="Total engineers"
        />
        <StatsCard
          title="Total Expenses"
          value={`€${totalExpenses.toLocaleString()}`}
          icon={Euro}
          description="All time expenses"
        />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trip Timeline</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={showAggregated ? 'aggregated' : 'detailed'} onValueChange={(v) => setShowAggregated(v === 'aggregated')}>
                <TabsList>
                  <TabsTrigger value="aggregated">Aggregated</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={timelineView} onValueChange={(value: TimelineView) => setTimelineView(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              {(timelineView === 'day' || !showAggregated) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timelineView === 'day' || !showAggregated ? (
            <TimelineView
              trips={trips}
              engineers={engineers}
              currentDate={currentDate}
              viewType={timelineView === 'day' || timelineView === 'year' ? 'month' : timelineView}
            />
          ) : (
            <AggregatedTimeline
              trips={trips}
              engineers={engineers}
              currentDate={currentDate}
              aggregationType={timelineView}
            />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTrips.map((trip) => {
              const engineer = getEngineerById(trip.engineerId);
              const duration = getTripDuration(trip);
              
              return (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-2 h-12 rounded-full"
                      style={{ backgroundColor: engineer?.color }}
                    />
                    <div>
                      <div className="font-semibold">{trip.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {engineer?.name} • {trip.location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                        {' • '}{duration} days
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[trip.status]}>
                    {trip.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
