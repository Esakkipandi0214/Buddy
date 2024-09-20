import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

export default function TopExpenseCard() {
  const categories = [
    { name: 'Food & Dining', amount: 523.45 },
    { name: 'Rent', amount: 1200.00 },
    { name: 'Transportation', amount: 234.56 },
    { name: 'Utilities', amount: 189.32 },
    { name: 'Entertainment', amount: 150.30 },
    { name: 'Shopping', amount: 250.00 },
  ];
  const totalExpenses = 2547.63;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Expense</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{categories[0].name}</div>
        <p className="text-xs text-muted-foreground">
          ${categories[0].amount.toFixed(2)} ({((categories[0].amount / totalExpenses) * 100).toFixed(1)}% of total)
        </p>
      </CardContent>
    </Card>
  );
}
