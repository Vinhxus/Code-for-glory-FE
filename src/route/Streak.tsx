import { useMemo } from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isFuture,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';

// mock cho lịch
function generateMockHistory(habitId: number, days: Date[]): Set<string> {
  const completed = new Set<string>();
  days.forEach((day, i) => {
    if (isFuture(day)) return;
    const recentStreak = i >= days.length - 15;
    const seed = (i + habitId * 11) % 7;
    if (recentStreak || seed !== 0) {
      completed.add(format(day, 'yyyy-MM-dd'));
    }
  });
  return completed;
}

function computeStreakStats(days: Date[], completed: Set<string>) {
  let longestStreak = 0;
  let running = 0;
  let totalCompleted = 0;

  days.forEach((day) => {
    const key = format(day, 'yyyy-MM-dd');
    if (completed.has(key)) {
      running += 1;
      totalCompleted += 1;
      longestStreak = Math.max(longestStreak, running);
    } else if (!isFuture(day)) {
      running = 0;
    }
  });

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (isFuture(day)) continue;
    const key = format(day, 'yyyy-MM-dd');
    if (completed.has(key)) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak, totalCompleted };
}

type StatCardProps = {
  label: string;
  value: string;
  accent: string;
};

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-zinc-800 border-2 border-zinc-700 p-5 flex flex-col gap-1 text-center shadow-md">
      <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-2xl font-black ${accent}`}>{value}</span>
    </div>
  );
}

export function Streak() {
  const today = useMemo(() => new Date(), []);

  // 1. Lấy danh sách 6 tháng gần đây
  const monthsData = useMemo(() => {
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const daysInMonth = eachDayOfInterval({ start, end });
      list.push({
        monthLabel: format(monthDate, 'MMMM yyyy'),
        days: daysInMonth,
      });
    }
    return list;
  }, [today]);

  // Gom toàn bộ ngày lại để tính toán Stats
  const allDays = useMemo(() => {
    return monthsData.flatMap((m) => m.days);
  }, [monthsData]);

  const completedSet = useMemo(
    () => generateMockHistory(1, allDays),
    [allDays]
  );

  const { currentStreak, longestStreak, totalCompleted } = useMemo(
    () => computeStreakStats(allDays, completedSet),
    [allDays, completedSet]
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 text-zinc-100">
      {/* Header căn giữa to rõ */}
      <header className="flex flex-col items-center text-center gap-1">
        <h1 className="text-4xl font-black tracking-tight text-blue-400">
          STREAK PROFILE
        </h1>
        <p className="text-base text-zinc-400 font-medium">
          Review your disciplined journey
        </p>
      </header>

      {/* Grid thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Current streak"
          value={`${currentStreak} 🔥`}
          accent="text-amber-500"
        />
        <StatCard
          label="Longest streak"
          value={`${longestStreak} 🏆`}
          accent="text-violet-400"
        />
        <StatCard
          label="Completed (6mo)"
          value={`${totalCompleted} Days`}
          accent="text-green-400"
        />
      </div>

      {/* Vùng danh sách các tháng nằm ở giữa, giao diện to rõ ràng */}
      <div className="flex flex-col gap-8 items-center w-full">
        {monthsData.map((month, mIndex) => (
          <div
            key={mIndex}
            className="w-full max-w-2xl rounded-2xl bg-zinc-800 border-2 border-zinc-700 p-6 shadow-xl"
          >
            {/* Tên tháng to, nằm giữa */}
            <h2 className="text-xl font-bold text-center text-blue-300 mb-6 border-b border-zinc-700 pb-3 uppercase tracking-wide">
              {month.monthLabel}
            </h2>

            {/* Danh sách các ô ngày dạng lưới 7 cột (tương ứng Thứ trong tuần) */}
            <div className="grid grid-cols-7 gap-3 justify-items-center">
              {/* Render tiêu đề Thứ nhỏ phía trên mỗi cột */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold text-zinc-500 w-10 text-center mb-1"
                >
                  {d}
                </span>
              ))}

              {/* Thêm ô trống nếu ngày đầu tiên của tháng không phải Chủ Nhật */}
              {Array.from({ length: month.days[0].getDay() }).map((_, idx) => (
                <div key={`empty-${idx}`} className="w-10 h-10" />
              ))}

              {/* Duyệt render từng ngày trong tháng */}
              {month.days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const isCurrentDay = isToday(day);
                const isFutureDay = isFuture(day);
                const isDone = completedSet.has(dateKey);

                return (
                  <div
                    key={dateKey}
                    title={format(day, 'eeee, dd/MM/yyyy')}
                    className={`
                      relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-150
                      ${
                        isFutureDay
                          ? 'text-zinc-600 cursor-not-allowed'
                          : isDone
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-900 shadow-md scale-105'
                            : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                      }
                      ${isCurrentDay ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-800' : ''}
                    `}
                  >
                    {format(day, 'd')}

                    {/* Chấm nhỏ bên dưới nếu là ngày hiện tại nhưng chưa làm */}
                    {isCurrentDay && !isDone && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
