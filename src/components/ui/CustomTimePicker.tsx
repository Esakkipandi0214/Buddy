import React, { useState, useEffect, useRef } from "react";

type TimePickerProps = {
  hour: string;
  minute: string;
  ampm: string;
  onChange: (hour: string, minute: string, ampm: string) => void;
};

export default function CustomTimePicker({ hour, minute, ampm, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null); // ref for detecting outside click

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const ampmOptions = ["AM", "PM"];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={pickerRef} className="relative w-full my-2">
      <div
        className="flex items-center justify-between border border-purple-300 rounded-lg px-3 py-2 cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        <span className=" text-black">{hour}:{minute} {ampm}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </div>

      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex">
          {/* Hours */}
          <ul className="max-h-32 overflow-y-auto flex-1 border-r border-gray-200">
            {hours.map(h => (
              <li
                key={h}
                className={`px-3 py-2 text-black cursor-pointer hover:bg-purple-100 ${h === hour ? "bg-purple-200 font-semibold" : ""}`}
                onClick={(e) => { e.stopPropagation(); onChange(h, minute, ampm); }}
              >
                {h}
              </li>
            ))}
          </ul>

          {/* Minutes */}
          <ul className="max-h-32 overflow-y-auto flex-1 border-r border-gray-200">
            {minutes.map(m => (
              <li
                key={m}
                className={`px-3 py-2 text-black cursor-pointer hover:bg-purple-100 ${m === minute ? "bg-purple-200 font-semibold" : ""}`}
                onClick={(e) => { e.stopPropagation(); onChange(hour, m, ampm); }}
              >
                {m}
              </li>
            ))}
          </ul>

          {/* AM/PM */}
          <ul className="max-h-32 overflow-y-auto flex-1">
            {ampmOptions.map(a => (
              <li
                key={a}
                className={`px-3 py-2 text-black cursor-pointer hover:bg-purple-100 ${a === ampm ? "bg-purple-200 font-semibold" : ""}`}
                onClick={(e) => { e.stopPropagation(); onChange(hour, minute, a); setOpen(false); }}
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
