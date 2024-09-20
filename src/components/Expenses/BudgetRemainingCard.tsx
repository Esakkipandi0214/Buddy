import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function BudgetRemainingCard() {
  const totalExpenses = 2547.63;
  const monthlyBudget = 3000;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${(monthlyBudget - totalExpenses).toFixed(2)}</div>
        <Progress 
          value={(totalExpenses / monthlyBudget) * 100} 
          className="mt-2"
          aria-label="Budget progress"
        />
      </CardContent>
    </Card>
  );
}
