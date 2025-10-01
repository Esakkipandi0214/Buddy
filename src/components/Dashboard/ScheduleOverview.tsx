import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "@/firebase"; // Adjust the import path as needed

interface Schedule {
  date: string;
  description: string;
  time: string;
  title: string;
  userId: string;
}

const ScheduleOverview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userUid = localStorage.getItem("userUid");
        if (!userUid) throw new Error("User UID not found in local storage.");

        const db = getFirestore(app);
        const schedulesCollection = collection(db, "Scheduler");
        const today = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format
        const q = query(
          schedulesCollection,
          where("userId", "==", userUid),
          where("date", "==", today)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setSchedules([]);
          setLoading(false);
          return;
        }

        const fetchedSchedules = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Schedule, "id">),
        }));

        setSchedules(fetchedSchedules);
      } catch (error) {
        setError("Failed to fetch schedules.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();

    // Set current date in 'Month Day, Year' format
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-[1.01]">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 md:pb-4 border-b border-purple-200">
        <CardTitle className="  text-lg md:text-2xl lg:text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-transparent bg-clip-text">
          Today&apos;s Schedule
        </CardTitle>

        <Badge
          variant="outline"
          className="mt-2 sm:mt-0 flex items-center bg-gradient-to-r from-purple-600/20 to-pink-500/20 text-purple-800 border-purple-400 rounded-full px-3 py-1 text-sm"
        >
          <CalendarIcon className="mr-1 h-4 w-4" />
          {currentDate}
        </Badge>
      </CardHeader>

      <CardContent className="mt-2">
        <ScrollArea className="h-[320px] pr-4">
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center shadow-md">
                <Clock className=" h-5 w-5 md:h-8 md:w-8 text-purple-600" />
              </div>
              <p className=" text-base md:text-lg font-semibold text-purple-700">
                No tasks scheduled today
              </p>
              <p className="text-sm text-gray-500">
                You&apos;re all caught up — enjoy your day! 🌞
              </p>
            </div>
          ) : (
            schedules.map((event) => (
              <div
                key={event.time}
                className="mb-4 last:mb-0 p-4 border border-black/30 rounded-2xl bg-white/70 shadow-inner hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col   space-y-2 ">
                  <div className=" flex gap-3 justify-between">
                    <h3 className="text-lg hidden md:flex text-gray-600   ">
                      <span className="font-bold text-gray-800">Tile:</span>{" "}
                      {event.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="flex items-center w-[40%] md:w-[20%] bg-purple-600 text-white md:px-3 md:py-1.5 rounded-xl md:rounded-full text-sm shadow-sm"
                    >
                      <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      {event.time}
                    </Badge>
                  </div>

                  <div className='flex-1 gap-2 space-y-2 md:space-y-0'>
                    <h3 className="text-lg md:hidden flex text-gray-600   ">
                      <span className="font-bold text-gray-800">Tile:</span>{" "}
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-600 ">
                      {" "}
                      <span className="font-bold text-gray-800">
                        {" "}
                        Desciption:
                      </span>{" "}
                      {event.description}
                    </p>
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
