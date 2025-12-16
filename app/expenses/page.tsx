"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Trash2, Receipt } from 'lucide-react';
import { getEngineerById } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Expense } from '@/types';
import { ExpenseSidebar } from '@/components/expense-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ExpensesPage() {
  const { engineers, trips, expenses, addExpense, updateExpense, deleteExpense, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Find engineer matching current user
  const currentEngineer = engineers.find(e => e.email === currentUser?.email);

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    const matchesEngineer = engineerFilter === 'all' || expense.engineerId === engineerFilter;

    return matchesSearch && matchesType && matchesEngineer;
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

      {/* Filters and Summary */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
        <Card className="lg:w-[200px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <span className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
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
