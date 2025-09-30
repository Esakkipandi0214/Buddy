import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import MonthlyCalendar from "./monthly-calendar";
import Layout from "@/components/staticComponents/layout";
import { useRouter } from "next/router";
import CustomTimePicker from "@/components/ui/CustomTimePicker";
import { Plus, Check, Trash2, Edit2 } from "lucide-react";
import checkUserExists from '../../utils/checkUserExists';

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
};

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskHour, setNewTaskHour] = useState<string>("12");
  const [newTaskMinute, setNewTaskMinute] = useState<string>("00");
  const [newTaskAmPm, setNewTaskAmPm] = useState<string>("AM");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [access, setAccess] = useState<boolean>(false);
  const router = useRouter();

 useEffect(() => {
    const verifyUser = async () => {
      const userUid = localStorage.getItem("userUid")
      if (!userUid) {
        localStorage.clear()
        router.push("/")
        return
      }

      const exists = await checkUserExists(userUid)
      if (exists) {
        setAccess(true)
      } else {
        router.push("/")
      }
    }

    verifyUser()
  }, [router])

  useEffect(() => {
    const userUid = localStorage.getItem("userUid");
    if (!userUid) return;

    const tasksRef = collection(db, "Scheduler");
    const q = query(tasksRef, where("userId", "==", userUid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const tasksForSelectedDate = tasks?.filter(
    (task) => task.date === formatDate(selectedDate)
  );

  async function handleAddOrEditTask() {
    if (!newTaskTitle) return;

    const userUid = localStorage.getItem("userUid");
    if (!userUid) return;

    const taskDate = formatDate(selectedDate);
    const taskTime = `${newTaskHour}:${newTaskMinute} ${newTaskAmPm}`;

    if (isEditing && editingTaskId) {
      const taskRef = doc(db, "Scheduler", editingTaskId);
      await updateDoc(taskRef, {
        title: newTaskTitle,
        time: taskTime,
        description: newTaskDescription,
        date: taskDate,
      });
      setIsEditing(false);
      setEditingTaskId(null);
    } else {
      await addDoc(collection(db, "Scheduler"), {
        title: newTaskTitle,
        date: taskDate,
        time: taskTime,
        description: newTaskDescription,
        userId: userUid,
      });
    }

    // Reset form
    setNewTaskTitle("");
    setNewTaskHour("12");
    setNewTaskMinute("00");
    setNewTaskAmPm("AM");
    setNewTaskDescription("");
    setShowAddForm(false);
  }

  function handleEditTask(task: Task) {
    setIsEditing(true);
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);

    const [hourMin, ampm] = task.time.split(" ");
    const [hour, minute] = hourMin.split(":");
    setNewTaskHour(hour);
    setNewTaskMinute(minute);
    setNewTaskAmPm(ampm);

    setNewTaskDescription(task.description);
    setIsDrawerOpen(true);
    setShowAddForm(true);
  }

  async function handleDeleteTask(id: string) {
    await deleteDoc(doc(db, "Scheduler", id));
  }

  return (
    <>
      {access ? (
        <Layout>
          <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
              Calendar & Tasks
            </h1>

            <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-purple-200">
              <MonthlyCalendar
                tasks={tasks}
                currentDate={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setIsDrawerOpen(true);
                }}
              />
            </div>

            {/* Side Drawer */}
            <div
              className={`fixed right-0 bg-white shadow-2xl p-6 z-50 transform transition-transform duration-300
                ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}
                top-0 pt-20 md:pt-20 lg:pt-0 sm:top-0 sm:w-96 w-full h-full rounded-tl-3xl sm:rounded-none`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-purple-700 text-center sm:text-left">
                  Tasks for {selectedDate.toDateString()}
                </h2>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsEditing(false);
                    setEditingTaskId(null);
                    setNewTaskTitle("");
                    setNewTaskHour("12");
                    setNewTaskMinute("00");
                    setNewTaskAmPm("AM");
                    setNewTaskDescription("");
                    setShowAddForm(false);
                  }}
                  className="text-white bg-gradient-to-r from-red-500 to-pink-600 px-3 py-1 rounded-lg hover:opacity-90 active:scale-95 transition"
                >
                  &times;
                </button>
              </div>

              {/* Task List */}
              <div
                className={`overflow-y-auto mb-4 ${
                  tasksForSelectedDate.length > 5 ? "max-h-60" : "max-h-[50vh]"
                }`}
              >
                {tasksForSelectedDate.length > 0 ? (
                  <ul className="space-y-2">
                    {tasksForSelectedDate.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    No tasks for this date.
                  </p>
                )}
              </div>

              {/* Floating Add Task Button */}
              <div className="fixed bottom-6 right-6 flex justify-end z-50">
                <button
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {showAddForm ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Add/Edit Task Form */}
              {showAddForm && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg text-black font-semibold mb-2">
                    {isEditing ? "Edit Task" : "Add New Task"}
                  </h3>

                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task Title"
                    className="w-full border text-black border-purple-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  <CustomTimePicker
                    hour={newTaskHour}
                    minute={newTaskMinute}
                    ampm={newTaskAmPm}
                    onChange={(h, m, a) => {
                      setNewTaskHour(h);
                      setNewTaskMinute(m);
                      setNewTaskAmPm(a);
                    }}
                  />

                  <input
                    type="text"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full text-black border border-purple-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  <button
                    onClick={handleAddOrEditTask}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition"
                  >
                    {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span className=" ">{isEditing ? "Save Task" : "Add Task"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Layout>
      ) : (
        <div className="fixed inset-0 flex justify-center items-center bg-white/80 z-50">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
      <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
    </div>
  </div>
      )}
    </>
  );
}

// TaskItem component with delete confirm logic
function TaskItem({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <li className="flex justify-between items-center bg-purple-50 p-2 rounded-lg">
      <div>
        <p className="font-semibold text-gray-800">{task.title}</p>
        <p className="text-sm text-gray-600">{task.time} | {task.description}</p>
      </div>

      <div className="flex gap-2">
        {/* Edit */}
        {!confirmDelete && <button
  onClick={() => onEdit(task)}
  className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full flex items-center justify-center"
>
  <Edit2 className="w-5 h-5" />
</button>}


        {/* Delete / Confirm */}
        {!confirmDelete ? (
          <button
  onClick={() => setConfirmDelete(true)}
  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center"
>
  <Trash2 className="w-5 h-5" />
</button>

        ) : (
          <>
            {/* Confirm */}
            <button
              onClick={() => onDelete(task.id)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>

            {/* Cancel */}
            <button
              onClick={() => setConfirmDelete(false)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </li>
  );
}
