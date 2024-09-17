import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore'
import MonthlyCalendar from './monthly-calendar'
import Layout from '@/components/staticComponents/layout'

type Task = {
  id: string
  title: string
  date: string
  time: string
  description: string
}

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>(getWeekDates(new Date()))
  const [newTaskTitle, setNewTaskTitle] = useState<string>('')
  const [newTaskTime, setNewTaskTime] = useState<string>('')
  const [newTaskDescription, setNewTaskDescription] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate))
  }, [selectedDate])

  useEffect(() => {
    const fetchTasks = async () => {
      const userUid = localStorage.getItem('userUid')
      if (!userUid) return

      const tasksRef = collection(db, 'Scheduler')
      const q = query(tasksRef, where('userId', '==', userUid))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
        setTasks(tasksData)
      })

      return () => unsubscribe()
    }

    fetchTasks()
  }, [])

  useEffect(() => {
    if (tasks.some((task) => task.date === selectedDate.toISOString().split('T')[0])) {
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [selectedDate, tasks])

  function getWeekDates(date: Date): Date[] {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay() + 1) // Adjust to Monday
    return Array(7)
      .fill(null)
      .map((_, i) => {
        const day = new Date(start)
        day.setDate(day.getDate() + i)
        return day
      })
  }

  async function handleAddTask() {
    if (!newTaskTitle || !newTaskTime) return

    const userUid = localStorage.getItem('userUid')
    if (!userUid) {
      console.error('User not authenticated')
      return
    }

    if (isEditing && editingTaskId) {
      const taskRef = doc(db, 'Scheduler', editingTaskId)
      await updateDoc(taskRef, {
        title: newTaskTitle,
        time: newTaskTime,
        description: newTaskDescription,
      })
      setIsEditing(false)
      setEditingTaskId(null)
    } else {
      const newTask = {
        title: newTaskTitle,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: newTaskTime,
        description: newTaskDescription,
      }
      await addDoc(collection(db, 'Scheduler'), { ...newTask, userId: userUid })
    }

    setNewTaskTitle('')
    setNewTaskTime('')
    setNewTaskDescription('')
  }

  async function handleEditTask(task: Task) {
    setIsEditing(true)
    setEditingTaskId(task.id)
    setNewTaskTitle(task.title)
    setNewTaskTime(task.time)
    setNewTaskDescription(task.description)
  }

  async function handleDeleteTask(id: string) {
    await deleteDoc(doc(db, 'Scheduler', id))
  }

  if (weekDates.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>

        <div className="mb-4">
          {/* Task Input */}
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task Title"
            className="border border-gray-300 p-2 m-2"
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="border border-gray-300 p-2 m-2"
          />
          <input
            type="text"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Description"
            className="border border-gray-300 p-2 m-2"
          />
          <button onClick={handleAddTask} className="bg-blue-500 text-white p-2 rounded">
            {isEditing ? 'Save Task' : 'Add Task'}
          </button>
        </div>

        {/* Pass tasks to MonthlyCalendar */}
        <div className="mb-4">
          <MonthlyCalendar tasks={tasks} currentDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 sm:p-0 p-2 z-50">
            <div className="bg-white sm:p-6 p-2 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tasks on {selectedDate.toDateString()}:</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-red-500 px-2  border rounded-lg ">
                  &times;
                </button>
              </div>

              <div className="overflow-x-auto">
                {tasks.filter((task) => task.date === selectedDate.toISOString().split('T')[0]).length > 0 ? (
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks
                        .filter((task) => task.date === selectedDate.toISOString().split('T')[0])
                        .map((task, index) => (
                          <tr
                            key={task.id}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}
                          >
                            <td className="px-4 py-2 text-gray-900 font-medium">{task.title}</td>
                            <td className="px-4 py-2 text-gray-600">{task.time}</td>
                            <td className="px-4 py-2 text-gray-600">{task.description}</td>
                            <td className="px-4 flex py-2">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No tasks for this date.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
