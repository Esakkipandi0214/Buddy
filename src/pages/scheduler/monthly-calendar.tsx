import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  title: string;
  date: string; // Date in YYYY-MM-DD format
}

type MonthlyCalendarProps = {
  tasks: Task[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ tasks, currentDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(currentDate));

  // Debugging: Log current tasks and date
  console.log("Tasks:", tasks);
  console.log("Current Date:", currentDate);
  console.log("Current Month:", currentMonth);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Debugging: Log days in month and first day of month
  console.log("Days in Month:", daysInMonth);
  console.log("First Day of Month:", firstDayOfMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(newDate);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
  
    for (let i = 0; i < totalSlots; i++) {
      const dayOffset = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayOffset > 0 && dayOffset <= daysInMonth;
      const date = isCurrentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOffset) : null;
  
      // Use local date formatting to avoid time zone issues
      const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
  
      // Debugging: Log for verification
      console.log("Day Offset:", dayOffset, "Date:", date, "Formatted Date:", formattedDate);
  
      // Filter tasks for the current date
      const dayTasks = tasks.filter(task => task.date === formattedDate);
  
      days.push(
        <div
          key={i}
          className={`p-2 border ${isCurrentMonth ? 'bg-white' : 'bg-gray-100'} ${
            isCurrentMonth &&
            dayOffset === currentDate.getDate() &&
            currentMonth.getMonth() === currentDate.getMonth() &&
            currentMonth.getFullYear() === currentDate.getFullYear()
              ? 'bg-blue-100'
              : ''
          } cursor-pointer`}
          onClick={() => isCurrentMonth && handleDateClick(dayOffset)}
        >
          {isCurrentMonth && (
            <>
              <div className="font-bold">{dayOffset}</div>
              {dayTasks.length > 0 && (
                <div className="text-xs truncate">
                  {dayTasks.map(task => (
                    <div key={task.id}>{task.title}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
  
    return days;
  };
          
  

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button onClick={() => navigateMonth('prev')}><ChevronLeftIcon /></Button>
          <CardTitle>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
          <Button onClick={() => navigateMonth('next')}><ChevronRightIcon /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-bold text-center">{day}</div>
          ))}
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyCalendar;
