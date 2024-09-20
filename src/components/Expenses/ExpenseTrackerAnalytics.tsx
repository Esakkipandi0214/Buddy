import React from 'react';
import TotalExpensesCard from './TotalExpensesCard';
import BudgetRemainingCard from './BudgetRemainingCard';
import SavingsProgressCard from './SavingsProgressCard';
import TopExpenseCard from './TopExpenseCard';
import MonthlyBudgetOverview from './MonthlyBudgetOverview';
import WeeklySpendingHeatmap from './WeeklySpendingHeatmap';
import ExpenseBreakdown from './ExpenseBreakdown';

export default function ExpenseTrackerAnalytics() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalExpensesCard />
        <BudgetRemainingCard />
        <SavingsProgressCard />
        <TopExpenseCard />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseBreakdown />
        <WeeklySpendingHeatmap />
        <MonthlyBudgetOverview />
      </div>
    </div>
  );
}
