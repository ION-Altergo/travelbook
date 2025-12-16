"use client";

import { Mail, Calendar } from 'lucide-react';
import { getTripsByEngineer, calculateEngineerDaysInPeriod } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { startOfYear, endOfYear } from 'date-fns';

export default function EngineersPage() {
  const { engineers, trips } = useData();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Engineers</h1>
        <p className="text-muted-foreground">
          Engineering team overview and statistics
        </p>
      </div>

      {/* Engineers Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {engineers.map((engineer) => {
          const engineerTrips = trips.filter(t => t.engineerId === engineer.id);
          const daysThisYear = calculateEngineerDaysInPeriod(engineer.id, yearStart, yearEnd, trips);
          const activeTrips = engineerTrips.filter(t => t.status === 'in-progress').length;
          const upcomingTrips = engineerTrips.filter(t => t.status === 'planned' || t.status === 'confirmed').length;

          return (
            <Card key={engineer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback 
                      className="text-lg font-semibold"
                      style={{ backgroundColor: `${engineer.color}20`, color: engineer.color }}
                    >
                      {engineer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{engineer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {engineer.role}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a 
                        href={`mailto:${engineer.email}`} 
                        className="hover:text-primary transition-colors"
                      >
                        {engineer.email}
                      </a>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: engineer.color }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{engineerTrips.length}</div>
                    <div className="text-xs text-muted-foreground">Total Trips</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{daysThisYear}</div>
                    <div className="text-xs text-muted-foreground">Days ({currentYear})</div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  {activeTrips > 0 && (
                    <Badge className="bg-green-100 text-green-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      {activeTrips} Active
                    </Badge>
                  )}
                  {upcomingTrips > 0 && (
                    <Badge className="bg-blue-100 text-blue-700">
                      {upcomingTrips} Upcoming
                    </Badge>
                  )}
                  {activeTrips === 0 && upcomingTrips === 0 && (
                    <Badge className="bg-gray-100 text-gray-600">
                      Available
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Engineers</div>
              <div className="text-2xl font-bold">{engineers.length}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Days ({currentYear})</div>
              <div className="text-2xl font-bold">
                {engineers.reduce((sum, e) => 
                  sum + calculateEngineerDaysInPeriod(e.id, yearStart, yearEnd, trips), 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

