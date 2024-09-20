"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  userId: string | null;
  notes: string;
}

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userUid, setUserUid] = useState<string>("");

  useEffect(() => {
    const storedUserUid = localStorage.getItem("userUid");
    if (storedUserUid) {
      setUserUid(storedUserUid);
    }
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (userUid) {
        const expensesQuery = query(collection(db, "userExpenses"), where("userId", "==", userUid));
        const querySnapshot = await getDocs(expensesQuery);
        const expensesList: Expense[] = [];
        querySnapshot.forEach((doc) => {
          expensesList.push({ id: doc.id, ...doc.data() } as Expense);
        });
        setExpenses(expensesList);
        setFilteredExpenses(expensesList); // Initialize with all user expenses
      }
    };

    fetchExpenses();
  }, [userUid]);

  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const matchesName = expense.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesDate = dateFilter ? expense.date === dateFilter : true;
      return matchesName && matchesDate;
    });
    setFilteredExpenses(filtered);
  }, [nameFilter, dateFilter, expenses]);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-4 shadow-lg border border-gray-300 rounded-lg">
        <CardHeader>
          <CardTitle>Filter Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <Input
              placeholder="Filter by name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="flex-1 border-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-150"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 border-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-150"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border border-gray-300 rounded-lg">
        <CardHeader className=" my-1">
          <div className="flex items-center justify-between space-x-8">
          <CardTitle>All Expenses</CardTitle>
    <Link href="/ExpenseTracker" className=" hover:underline hover:text-blue-500">back</Link>
    </div>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
  <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
    <thead>
      <tr className="bg-blue-100">
        <th className="border border-gray-300 p-2 text-left">Name</th>
        <th className="border border-gray-300 p-2 text-left">Date</th>
        <th className="border border-gray-300 p-2 text-left">Amount</th>
        <th className="border border-gray-300 p-2 text-left">Notes</th>
      </tr>
    </thead>
    <tbody>
      {filteredExpenses.length > 0 ? (
        filteredExpenses.map((expense) => (
          <tr key={expense.id} className="hover:bg-gray-100 transition duration-150">
            <td className="border border-gray-300 p-2 truncate">{expense.name}</td>
            <td className="border border-gray-300 p-2 truncate">{expense.date}</td>
            <td className="border border-gray-300 p-2 truncate">₹{expense.amount.toFixed(2)}</td>
            <td className="border border-gray-300 p-2 truncate">{expense.notes}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={4} className="border border-gray-300 p-2 text-center">No expenses found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
        </CardContent>
      </Card>
    </div>
  );
}
