"use client";

import { useState, useMemo } from 'react';
import { format, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Plus, Search, Trash2, Receipt, Calendar as CalendarIcon } from 'lucide-react';
import { getEngineerById } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Expense } from '@/types';
import { ExpenseSidebar } from '@/components/expense-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function ExpensesPage() {
  const { engineers, trips, expenses, addExpense, updateExpense, deleteExpense, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Time range filters
  const [timeRangeType, setTimeRangeType] = useState<'all' | 'year' | 'custom'>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  // Find engineer matching current user
  const currentEngineer = engineers.find(e => e.email === currentUser?.email);

  // Get available years from expenses
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    expenses.forEach(expense => {
      const year = new Date(expense.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    
    // Search filter
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    
    // Engineer filter
    const matchesEngineer = engineerFilter === 'all' || expense.engineerId === engineerFilter;
    
    // Time range filter
    let matchesTimeRange = true;
    if (timeRangeType === 'year') {
      const yearStart = startOfYear(new Date(parseInt(selectedYear), 0, 1));
      const yearEnd = endOfYear(new Date(parseInt(selectedYear), 0, 1));
      matchesTimeRange = isWithinInterval(expenseDate, { start: yearStart, end: yearEnd });
    } else if (timeRangeType === 'custom' && customStartDate && customEndDate) {
      matchesTimeRange = isWithinInterval(expenseDate, { start: customStartDate, end: customEndDate });
    }

    return matchesSearch && matchesType && matchesEngineer && matchesTimeRange;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseTypeColors = {
    travel: 'bg-blue-100 text-blue-700',
    accommodation: 'bg-purple-100 text-purple-700',
    meals: 'bg-green-100 text-green-700',
    transportation: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const handleAddExpense = () => {
    // Create a default expense
    const defaultExpense: Omit<Expense, 'id'> = {
      tripId: trips[0]?.id || '',
      engineerId: currentEngineer?.id || engineers[0]?.id || '',
      type: 'other',
      amount: 0,
      currency: 'EUR',
      date: new Date(),
      description: 'New Expense',
    };
    
    // Add it and get the ID
    const newExpenseId = `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newExpense: Expense = { ...defaultExpense, id: newExpenseId };
    
    addExpense(defaultExpense);
    
    // Open sidebar with the new expense
    setSelectedExpense(newExpense);
    setIsSidebarOpen(true);
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsSidebarOpen(true);
  };

  const handleSave = (updatedExpense: Expense) => {
    updateExpense(updatedExpense.id, updatedExpense);
  };

  const handleDelete = (expenseId: string) => {
    deleteExpense(expenseId);
    setIsSidebarOpen(false);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(expenseId);
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (expenseId: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(expenseId);
      } else {
        newSet.delete(expenseId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.size} expense(s)?`)) {
      selectedIds.forEach(id => deleteExpense(id));
      setSelectedIds(new Set());
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      INR: '₹',
      GBP: '£',
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            {selectedIds.size > 0 
              ? `${selectedIds.size} expense(s) selected`
              : 'Track travel and on-site expenses'}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button onClick={handleDeleteSelected} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddExpense}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Total Summary Card - Fixed at top */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
            </div>
            <span className="text-3xl font-bold">€{totalExpenses.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} 
            {timeRangeType === 'year' && ` in ${selectedYear}`}
            {timeRangeType === 'custom' && customStartDate && customEndDate && 
              ` from ${format(customStartDate, 'MMM d, yyyy')} to ${format(customEndDate, 'MMM d, yyyy')}`}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="accommodation">Accommodation</SelectItem>
            <SelectItem value="meals">Meals</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger>
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

        <Select 
          value={timeRangeType} 
          onValueChange={(value: 'all' | 'year' | 'custom') => {
            setTimeRangeType(value);
            if (value === 'all') {
              setCustomStartDate(undefined);
              setCustomEndDate(undefined);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="year">By Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {timeRangeType === 'year' && (
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={new Date().getFullYear().toString()}>
                  {new Date().getFullYear()}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}

        {timeRangeType === 'custom' && (
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, 'MMM d, yyyy') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, 'MMM d, yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Team Member</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No expenses found. Click "Add Expense" to create one.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => {
                const engineer = getEngineerById(expense.engineerId);
                const trip = trips.find(t => t.id === expense.tripId);

                return (
                  <TableRow 
                    key={expense.id} 
                    className="hover:bg-muted/50"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(expense.id)}
                        onCheckedChange={(checked) => handleSelectOne(expense.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell 
                      className="text-sm cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: engineer?.color }}
                        />
                        <span className="text-sm font-medium">{engineer?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      <div className="text-sm">
                        <div className="font-medium">{trip?.projectName}</div>
                        <div className="text-muted-foreground text-xs">{trip?.location}</div>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      <Badge className={expenseTypeColors[expense.type]}>
                        {expense.type}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      {expense.description}
                    </TableCell>
                    <TableCell 
                      className="text-right font-medium cursor-pointer"
                      onClick={() => handleRowClick(expense)}
                    >
                      {getCurrencySymbol(expense.currency)}{expense.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Sidebar */}
      <ExpenseSidebar
        expense={selectedExpense}
        engineers={engineers}
        trips={trips}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
