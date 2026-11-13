import { DailyRoutine } from '../types';

export type ActivityStatus = 'upcoming' | 'starting' | 'in_progress' | 'all_completed' | 'empty';

export interface EvaluatedActivity {
  status: ActivityStatus;
  routine: DailyRoutine | null;
  tomorrowRoutine?: DailyRoutine | null;
  title: string;
  timeText: string;
  subtitleText: string;
  countdownText: string;
  shortCountdown: string;
  spokenText: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Converts "HH:MM" string to minutes from start of day
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Derives activity duration in minutes based on category and title keywords
 */
export function getRoutineDuration(routine: DailyRoutine): number {
  const cat = (routine.category || '').toLowerCase();
  const title = (routine.title || '').toLowerCase();
  if (cat.includes('meal') || title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('chai') || title.includes('tea')) return 45;
  if (cat.includes('medication') || title.includes('medicine') || title.includes('pill') || title.includes('dose')) return 20;
  if (cat.includes('activity') || cat.includes('walk') || cat.includes('exercise') || title.includes('walk') || title.includes('gardening') || title.includes('yoga') || title.includes('game')) return 40;
  if (cat.includes('night') || cat.includes('morning') || cat.includes('sleep') || cat.includes('wake')) return 30;
  return 30; // default duration in minutes
}

/**
 * Formats countdown string, e.g. "Starts in 15 minutes", "Starts in 1h 45m"
 */
export function formatCountdown(diffMinutes: number): string {
  if (diffMinutes <= 0) return 'Starting now';
  if (diffMinutes === 1) return 'Starts in 1 minute';
  if (diffMinutes < 60) return `Starts in ${diffMinutes} minutes`;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  if (m === 0) return `Starts in ${h} ${h === 1 ? 'hour' : 'hours'}`;
  return `Starts in ${h}h ${m}m`;
}

/**
 * Formats compact countdown for glance card, e.g. "In 15m", "In 1h 45m"
 */
export function formatShortCountdown(diffMinutes: number, status: ActivityStatus): string {
  if (status === 'starting') return 'Now';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'all_completed') return 'Done';
  if (diffMinutes <= 0) return 'Now';
  if (diffMinutes < 60) return `In ${diffMinutes}m`;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return m === 0 ? `In ${h}h` : `In ${h}h ${m}m`;
}

/**
 * Checks if routine applies to a given day of the week
 */
export function matchesDay(routine: DailyRoutine, dayName: string): boolean {
  if (!routine.day_of_week || routine.day_of_week.toLowerCase() === 'daily') return true;
  const days = routine.day_of_week.toLowerCase().split(',').map(s => s.trim());
  return days.includes(dayName.toLowerCase()) || days.includes('daily');
}

/**
 * Evaluates patient's upcoming activity against real-world local device time
 */
export function evaluateUpcomingActivity(
  routines: DailyRoutine[],
  currentTime: Date = new Date()
): EvaluatedActivity {
  if (!routines || routines.length === 0) {
    return {
      status: 'empty',
      routine: null,
      title: 'No activities scheduled',
      timeText: 'All Set',
      subtitleText: 'All set • Rest well',
      countdownText: 'All Set',
      shortCountdown: 'All Set',
      spokenText: 'You have no activities scheduled for today. You are all set!'
    };
  }

  const todayDayName = DAYS_OF_WEEK[currentTime.getDay()];
  const tomorrowDate = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDayName = DAYS_OF_WEEK[tomorrowDate.getDay()];

  // Active routines for today
  const todaysRoutines = routines
    .filter(r => r.is_active !== false && matchesDay(r, todayDayName))
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  // Active routines for tomorrow
  const tomorrowsRoutines = routines
    .filter(r => r.is_active !== false && matchesDay(r, tomorrowDayName))
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  if (todaysRoutines.length === 0) {
    const nextTomorrow = tomorrowsRoutines[0] || routines[0];
    const nextTimeStr = nextTomorrow ? `Next: ${nextTomorrow.time} tomorrow` : 'Rest well';
    return {
      status: 'all_completed',
      routine: null,
      tomorrowRoutine: nextTomorrow || null,
      title: 'No activities scheduled today',
      timeText: 'All Set',
      subtitleText: `All set • ${nextTimeStr}`,
      countdownText: 'All Set',
      shortCountdown: 'All Set',
      spokenText: `You have no activities scheduled for today. ${nextTomorrow ? `Your next activity tomorrow is ${nextTomorrow.title} at ${nextTomorrow.time}.` : 'Rest well!'}`
    };
  }

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // 1. Check for activity starting right now or currently in progress
  for (const r of todaysRoutines) {
    const rMins = parseTimeToMinutes(r.time);
    const duration = getRoutineDuration(r);
    const diff = rMins - currentMinutes;

    if (diff === 0) {
      return {
        status: 'starting',
        routine: r,
        title: r.title,
        timeText: r.time,
        subtitleText: `At ${r.time} • Starting now`,
        countdownText: 'Starting now',
        shortCountdown: 'Now',
        spokenText: `${r.title} is starting now at ${r.time}. ${r.description || ''}`
      };
    }

    if (diff < 0 && Math.abs(diff) < duration) {
      return {
        status: 'in_progress',
        routine: r,
        title: r.title,
        timeText: r.time,
        subtitleText: `At ${r.time} • In progress`,
        countdownText: 'In progress',
        shortCountdown: 'In Progress',
        spokenText: `${r.title} is currently in progress. Scheduled time was ${r.time}. ${r.description || ''}`
      };
    }
  }

  // 2. Find next upcoming activity today
  for (const r of todaysRoutines) {
    const rMins = parseTimeToMinutes(r.time);
    const diff = rMins - currentMinutes;

    if (diff > 0) {
      const countdown = formatCountdown(diff);
      const shortCd = formatShortCountdown(diff, 'upcoming');
      return {
        status: 'upcoming',
        routine: r,
        title: r.title,
        timeText: r.time,
        subtitleText: `At ${r.time} • ${countdown}`,
        countdownText: countdown,
        shortCountdown: shortCd,
        spokenText: `Next scheduled activity is ${r.title} at ${r.time}, ${countdown.toLowerCase()}. ${r.description || ''}`
      };
    }
  }

  // 3. All activities completed for today -> Show completion and next activity tomorrow
  const firstTomorrow = tomorrowsRoutines[0] || todaysRoutines[0];
  const tomorrowSub = firstTomorrow ? `Next: ${firstTomorrow.time} tomorrow` : 'Rest well';
  return {
    status: 'all_completed',
    routine: null,
    tomorrowRoutine: firstTomorrow || null,
    title: 'All activities completed for today',
    timeText: 'All Set',
    subtitleText: `All set • ${tomorrowSub}`,
    countdownText: 'Completed',
    shortCountdown: 'All Set',
    spokenText: `You have completed all scheduled activities for today. ${firstTomorrow ? `Your next activity tomorrow is ${firstTomorrow.title} at ${firstTomorrow.time}.` : 'Rest well!'}`
  };
}
