"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Receipt } from 'lucide-react';
import { getEngineerById } from '@/lib/data';
import { useData } from '@/contexts/data-context';
import { Expense } from '@/types';
import { ExpenseDialog } from '@/components/expense-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ExpensesPage() {
  const { engineers, trips, expenses, addExpense } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (expenseData.tripId && expenseData.engineerId && expenseData.type && 
        expenseData.amount && expenseData.currency && expenseData.date && expenseData.description) {
      addExpense({
        tripId: expenseData.tripId,
        engineerId: expenseData.engineerId,
        type: expenseData.type,
        amount: expenseData.amount,
        currency: expenseData.currency,
        date: expenseData.date,
        description: expenseData.description,
        receipt: expenseData.receipt,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track travel and on-site expenses
          </p>
        </div>
        <ExpenseDialog 
          engineers={engineers} 
          trips={trips} 
          onSave={handleSaveExpense}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          }
        />
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
        </div>
        <Card className="lg:w-[200px]">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => {
              const engineer = getEngineerById(expense.engineerId);
              const trip = trips.find(t => t.id === expense.tripId);

              return (
                <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-sm">
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: engineer?.color }}
                      />
                      <span className="text-sm font-medium">{engineer?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{trip?.projectName}</div>
                      <div className="text-muted-foreground text-xs">{trip?.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={expenseTypeColors[expense.type]}>
                      {expense.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <span className="text-sm truncate">{expense.description}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expense.currency} {expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || typeFilter !== 'all' || engineerFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first expense'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

