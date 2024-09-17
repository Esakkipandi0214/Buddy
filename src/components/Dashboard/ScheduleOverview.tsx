import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/firebase'; // Adjust the import path as needed

interface Schedule {
  date: string;
  description: string;
  time: string;
  title: string;
  userId: string;
}

const ScheduleOverview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userUid = localStorage.getItem('userUid');
        if (!userUid) throw new Error('User UID not found in local storage.');

        const db = getFirestore(app);
        const schedulesCollection = collection(db, 'Scheduler');
        const today = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
        const q = query(schedulesCollection, where('userId', '==', userUid), where('date', '==', today));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setSchedules([]);
          setLoading(false);
          return;
        }

        const fetchedSchedules = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Schedule, 'id'>)
        }));

        setSchedules(fetchedSchedules);
      } catch (error) {
        setError('Failed to fetch schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();

    // Set current date in 'Month Day, Year' format
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Today&apos;s Schedule</CardTitle>
        <Badge variant="outline" className="flex items-center">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {currentDate}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {schedules.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No tasks scheduled</div>
          ) : (
            schedules.map((event) => (
              <div key={event.time} className="mb-4 last:mb-0">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {event.time}
                  </Badge>
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScheduleOverview;
