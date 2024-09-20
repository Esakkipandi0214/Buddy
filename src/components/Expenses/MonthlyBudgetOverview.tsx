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

const monthlyBudget = 3000;

export default function MonthlyBudgetOverview() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Budget Overview</CardTitle>
        <CardDescription>Comparison of expenses to budget by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => {
            const budgetPercentage = (category.amount / (monthlyBudget / categories.length)) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span>${category.amount.toFixed(2)} / ${(monthlyBudget / categories.length).toFixed(2)}</span>
                </div>
                <Progress 
                  value={budgetPercentage > 100 ? 100 : budgetPercentage} 
                  className="h-2"
                  aria-label={`${category.name} budget usage`}
                />
                {budgetPercentage > 100 && (
                  <p className="text-xs text-red-500">
                    Over budget by ${(category.amount - (monthlyBudget / categories.length)).toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
