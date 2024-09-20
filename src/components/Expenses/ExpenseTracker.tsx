"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { History } from "lucide-react"; // Adjust according to your setup
import Link from "next/link";
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  userId: string | null;
  notes: string;
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseNames, setExpenseNames] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", notes: "" });
  const [newExpenseName, setNewExpenseName] = useState("");
  const [userUid, setUserUid] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false); // State for notes modal
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null); // Selected notes to display

  useEffect(() => {
    const storedUserUid = localStorage.getItem('userUid');
    if (storedUserUid) {
      setUserUid(storedUserUid);
      fetchExpenseNames(storedUserUid);
    }
  }, []);

  const fetchExpenseNames = async (uid: string) => {
    const userDocRef = doc(db, "ExpensesUser", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setExpenseNames(userDoc.data()?.names || []);
    }
  };

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
      }
    };

    fetchExpenses();
  }, [userUid]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Expense = {
      id: "",
      name: newExpense.name,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split('T')[0],
      userId: userUid,
      notes: newExpense.notes
    };
    await addDoc(collection(db, "userExpenses"), expense);
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
    setNewExpense({ name: "", amount: "", notes: "" });
  };

  const createExpenseName = async () => {
    if (newExpenseName && userUid) {
      const userDocRef = doc(db, "ExpensesUser", userUid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          names: [...(userDoc.data()?.names || []), newExpenseName]
        });
      } else {
        await setDoc(userDocRef, {
          names: [newExpenseName]
        });
      }

      setExpenseNames((prevNames) => [...prevNames, newExpenseName]);
      setNewExpenseName("");
      setIsModalOpen(false);
    }
  };

  const todayExpenses = expenses.filter(
    expense => expense.date === new Date().toISOString().split('T')[0]
  );

  const showNotesModal = (notes: string) => {
    setSelectedNotes(notes);
    setNotesModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg md:max-w-2xl">
      <Button onClick={() => setIsModalOpen(true)} className="mb-4">Add Expense Name</Button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-11/12 md:w-96">
            <CardHeader>
              <CardTitle>Create New Expense Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                placeholder="Enter new expense name"
                className="w-full"
              />
              <div className="flex justify-between mt-4">
                <Button onClick={createExpenseName}>Add</Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Today&apos;s Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addExpense} className="space-y-4">
            <div>
              <Label htmlFor="expenseName">Expense Name</Label>
              <Select
                onValueChange={(value: string) => {
                  setNewExpense({ ...newExpense, name: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an expense" />
                </SelectTrigger>
                <SelectContent>
                  {expenseNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expenseAmount">Amount</Label>
              <Input
                id="expenseAmount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="expenseNotes">Notes</Label>
              <Input
                id="expenseNotes"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="Enter notes (optional)"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
      <CardHeader className="flex justify-start items-center">
    <div className="flex items-center space-x-8">
      <CardTitle>Today&apos;s Expenses</CardTitle>
    <Link href="/ExpenseTrackerHistory"><History className="h-5 w-5 text-gray-600 mr-2" /></Link>
    </div>
  </CardHeader>
        <CardContent>
          {todayExpenses.length > 0 ? (
            <ul className="space-y-2">
              {todayExpenses.map((expense) => (
                <li key={expense.id} className="flex justify-between items-center">
                  <span
                    onClick={() => showNotesModal(expense.notes)} // Show notes in modal
                    className="cursor-pointer underline"
                  >
                    {expense.name}
                  </span>
                  <span>&#x20B9;{expense.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No expenses recorded for today.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal for showing notes */}
      {notesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-11/12 md:w-96">
            <CardHeader>
              <CardTitle>Expense Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedNotes}</p>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setNotesModalOpen(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
