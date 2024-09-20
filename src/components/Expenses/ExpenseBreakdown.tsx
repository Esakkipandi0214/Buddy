import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const categories = [
  { name: 'Food & Dining', amount: 523.45 },
  { name: 'Rent', amount: 1200.00 },
  { name: 'Transportation', amount: 234.56 },
  { name: 'Utilities', amount: 189.32 },
  { name: 'Entertainment', amount: 150.30 },
  { name: 'Shopping', amount: 250.00 },
];

const totalExpenses = 2547.63;

export default function ExpenseBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Percentage of total expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1/2">{category.name}</div>
              <div className="w-1/2">
                <Progress 
                  value={(category.amount / totalExpenses) * 100} 
                  className="h-2"
                  aria-label={`${category.name} expense percentage`}
                />
              </div>
              <div className="w-16 text-right">{((category.amount / totalExpenses) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
