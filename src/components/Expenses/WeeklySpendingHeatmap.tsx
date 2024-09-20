import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const weeklySpending = [
  [50, 30, 60, 80, 65, 45, 70],
  [40, 60, 75, 50, 80, 90, 55],
  [70, 80, 55, 60, 75, 40, 50],
  [60, 45, 70, 80, 50, 65, 75],
];

export default function WeeklySpendingHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Spending Heatmap</CardTitle>
        <CardDescription>Expense intensity over the past 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium">
              {day}
            </div>
          ))}
          {weeklySpending.flatMap((week, weekIndex) =>
            week.map((value, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="aspect-square rounded"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${value / 100})`,
                }}
                aria-label={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: $${value}`}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
