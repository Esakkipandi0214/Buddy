import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

export default function TotalExpensesCard() {
  const totalExpenses = 2547.63;
  const monthlyBudget = 3000;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">
          {((totalExpenses / monthlyBudget) * 100).toFixed(1)}% of monthly budget
        </p>
      </CardContent>
    </Card>
  );
}
