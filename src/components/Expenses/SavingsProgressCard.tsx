import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function SavingsProgressCard() {
  const currentSavings = 7500;
  const savingsGoal = 10000;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
        <PiggyBank className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${currentSavings.toFixed(2)}</div>
        <Progress 
          value={(currentSavings / savingsGoal) * 100} 
          className="mt-2"
          aria-label="Savings progress"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {((currentSavings / savingsGoal) * 100).toFixed(1)}% of ${savingsGoal} goal
        </p>
      </CardContent>
    </Card>
  );
}
