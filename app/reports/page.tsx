"use client";

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { getTripDuration, getEngineerById } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  const { engineers, trips, expenses } = useData();
  const [period, setPeriod] = useState<string>('month');
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('all');

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();

  // Filter data by date range
  const filteredTrips = trips.filter(trip => {
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const inRange = (tripStart <= end && tripEnd >= start);
    const matchesEngineer = selectedEngineerId === 'all' || trip.engineerId === selectedEngineerId;
    return inRange && matchesEngineer;
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const inRange = expenseDate >= start && expenseDate <= end;
    const matchesEngineer = selectedEngineerId === 'all' || expense.engineerId === selectedEngineerId;
    return inRange && matchesEngineer;
  });

  // Calculate totals
  const totalDays = filteredTrips.reduce((sum, trip) => sum + getTripDuration(trip), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Engineer breakdown
  const engineerBreakdown = engineers
    .map(engineer => {
      const engineerTrips = filteredTrips.filter(t => t.engineerId === engineer.id);
      const engineerExpenses = filteredExpenses.filter(e => e.engineerId === engineer.id);
      const days = engineerTrips.reduce((sum, t) => sum + getTripDuration(t), 0);
      const expenseTotal = engineerExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        engineer,
        trips: engineerTrips.length,
        days,
        expenseTotal,
      };
    })
    .filter(item => selectedEngineerId === 'all' || item.engineer.id === selectedEngineerId)
    .filter(item => item.trips > 0);

  // Expense breakdown by type
  const expensesByType = filteredExpenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExportReport = () => {
    console.log('Exporting report...');
    // In a real app, this would generate and download a PDF/Excel report
    alert('Report export functionality would generate a PDF or Excel file for customer delivery.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate reports for customer delivery
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Engineer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engineers</SelectItem>
            {engineers.map((engineer) => (
              <SelectItem key={engineer.id} value={engineer.id}>
                {engineer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTrips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="engineer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engineer">By Engineer</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="trips">Trip Details</TabsTrigger>
        </TabsList>

        {/* Engineer Breakdown */}
        <TabsContent value="engineer">
          <Card>
            <CardHeader>
              <CardTitle>Engineer Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Engineer</TableHead>
                    <TableHead className="text-right">Trips</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineerBreakdown.map(({ engineer, trips, days, expenseTotal }) => (
                    <TableRow key={engineer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: engineer.color }}
                          />
                          <div>
                            <div className="font-medium">{engineer.name}</div>
                            <div className="text-xs text-muted-foreground">{engineer.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{trips}</TableCell>
                      <TableCell className="text-right">{days}</TableCell>
                      <TableCell className="text-right">€{expenseTotal.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{filteredTrips.length}</TableCell>
                    <TableCell className="text-right">{totalDays}</TableCell>
                    <TableCell className="text-right">€{totalExpenses.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Breakdown */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(expensesByType).map(([type, amount]) => {
                  const percentage = (amount / totalExpenses) * 100;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{type}</span>
                        <span className="text-muted-foreground">
                          €{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trip Details */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const engineer = getEngineerById(trip.engineerId);
                    const duration = getTripDuration(trip);

                    return (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">{trip.projectName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: engineer?.color }}
                            />
                            {engineer?.name}
                          </div>
                        </TableCell>
                        <TableCell>{trip.location}</TableCell>
                        <TableCell>{duration} days</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{trip.status}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

