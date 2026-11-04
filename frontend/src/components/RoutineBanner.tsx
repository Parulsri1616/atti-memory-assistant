import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Bell } from 'lucide-react';
import { api } from '../services/api';

export const RoutineBanner: React.FC = () => {
  const [timeInfo, setTimeInfo] = useState<{
    day: string;
    date: string;
    time: string;
    period: string;
  }>({
    day: '',
    date: '',
    time: '',
    period: ''
  });

  const [activeRoutine, setActiveRoutine] = useState<{
    title: string;
    time: string;
    category: string;
    description?: string;
  } | null>(null);

  const updateClockAndRoutine = async () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeFormatted = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    let period = 'morning';
    if (hours >= 12 && hours < 17) period = 'afternoon';
    else if (hours >= 17 && hours < 21) period = 'evening';
    else if (hours >= 21 || hours < 5) period = 'night';

    setTimeInfo({
      day: days[now.getDay()],
      date: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
      time: timeFormatted,
      period
    });

    try {
      const bannerData = await api.getCurrentBanner();
      if (bannerData && bannerData.active_routine) {
        setActiveRoutine(bannerData.active_routine);
      }
    } catch (e) {
      // offline / quiet fallback
    }
  };

  useEffect(() => {
    updateClockAndRoutine();
    const interval = setInterval(updateClockAndRoutine, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-2xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-400/40 pb-3">
        {/* Day & Date */}
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/40 p-2.5 rounded-xl">
            <Calendar className="w-7 h-7 text-sky-100" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {timeInfo.day || 'Today'}
            </div>
            <div className="text-sm sm:text-base text-sky-100">
              {timeInfo.date}
            </div>
          </div>
        </div>

        {/* Big Spoken Time */}
        <div className="flex items-center gap-2 bg-sky-800/50 px-4 py-2 rounded-xl self-start sm:self-auto">
          <Clock className="w-6 h-6 text-sky-200" />
          <span className="text-2xl sm:text-3xl font-extrabold tracking-wide">
            {timeInfo.time}
          </span>
        </div>
      </div>

      {/* Routine Prompt Card */}
      {activeRoutine && (
        <div className="mt-3 flex items-start gap-3 bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-xl border border-sky-300/20">
          <div className="p-2 bg-sky-500/40 rounded-lg shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-amber-200 animate-calm-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Scheduled Activity • {activeRoutine.time}
            </div>
            <div className="text-base sm:text-lg font-bold text-white truncate">
              {activeRoutine.title}
            </div>
            {activeRoutine.description && (
              <div className="text-sm text-sky-100 line-clamp-1 mt-0.5">
                {activeRoutine.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
