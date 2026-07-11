import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDays,
  format,
  isAfter,
  isSameMonth,
  startOfWeek,
} from 'date-fns';
import './ActivityHeatmap.css';
import {
  getActivityCalendar,
  type ActivityCalendarResponse,
} from '../services/practiceApi';

type RangeOption = 'current' | 'last';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const CELL = 12; // kích thước 1 ô (px)
const GAP = 3; // khoảng cách giữa các ô (px)
const STEP = CELL + GAP; // khoảng cách tâm-tâm giữa 2 cột tuần

/** 0..4 dựa trên số submission trong ngày, dùng để chọn màu --cg-heat-N. */
function levelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

type WeekColumn = {
  weekStart: Date;
  days: Date[];
};

/** Chia [rangeStart, rangeEnd] thành các cột tuần (Chủ Nhật -> Thứ Bảy), giống layout GitHub/LeetCode. */
function buildWeeks(rangeStart: Date, rangeEnd: Date): WeekColumn[] {
  const firstWeekStart = startOfWeek(rangeStart, { weekStartsOn: 0 });
  const weeks: WeekColumn[] = [];
  let cursor = firstWeekStart;

  while (!isAfter(cursor, rangeEnd)) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    weeks.push({ weekStart: cursor, days });
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

/** Nhãn tháng đặt phía trên cột tuần đầu tiên chứa ngày mùng 1 (hoặc cột đầu tiên của range nếu tháng đó bị cắt). */
function monthLabelColumns(
  weeks: WeekColumn[],
  rangeStart: Date,
): { weekIndex: number; label: string }[] {
  const labels: { weekIndex: number; label: string }[] = [];
  let lastMonthKey = '';

  weeks.forEach((week, weekIndex) => {
    const daysInRange = week.days.filter((d) => !isAfter(d, week.days[6]));
    const anchorDay =
      daysInRange.find((d) => d.getDate() <= 7 && !isAfter(rangeStart, d)) ??
      week.days[0];
    const monthKey = format(anchorDay, 'yyyy-MM');
    const hasFirstOfMonth = week.days.some((d) => d.getDate() === 1);

    if (hasFirstOfMonth || (weekIndex === 0 && monthKey !== lastMonthKey)) {
      if (monthKey !== lastMonthKey) {
        labels.push({ weekIndex, label: format(anchorDay, 'MMM') });
        lastMonthKey = monthKey;
      }
    }
  });

  return labels;
}

type TooltipState = {
  x: number;
  y: number;
  date: Date;
  count: number;
};

type FetchState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: ActivityCalendarResponse };

function ActivityHeatmap() {
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState<FetchState>({
    status: 'loading',
  });
  const [range, setRange] = useState<RangeOption>('current');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const gridWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    // 'last' = 365 ngày lùi thêm 1 năm nữa (730), rồi FE tự cắt lấy đúng
    // khung 365 ngày phù hợp bên dưới — đơn giản hơn là thêm tham số year
    // riêng ở BE cho một tính năng chưa chắc được dùng nhiều.
    const days = range === 'current' ? 365 : 730;

    getActivityCalendar(days).then(
      (res) => {
        if (active) setFetchState({ status: 'ready', data: res });
      },
      () => {
        if (active) setFetchState({ status: 'error' });
      },
    );

    return () => {
      active = false;
    };
  }, [range]);

  // User bấm đổi range: set loading NGAY trong handler (không phải trong
  // effect) để tránh khoảng khắc hiển thị data cũ trong lúc chờ data mới,
  // và cũng tránh đúng lỗi 'set-state-in-effect' mà react-hooks/eslint bắt.
  function handleRangeChange(next: RangeOption) {
    if (next === range) {
      setMenuOpen(false);
      return;
    }
    setFetchState({ status: 'loading' });
    setRange(next);
    setMenuOpen(false);
  }

  const data = fetchState.status === 'ready' ? fetchState.data : null;
  const loading = fetchState.status === 'loading';
  const errored = fetchState.status === 'error';

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    if (!data) return map;
    for (const d of data.days) map.set(d.date, d.count);
    return map;
  }, [data]);

  const { weeks, monthLabels, rangeStart, rangeEnd, displayedActiveDays, displayedTotal } =
    useMemo(() => {
      if (!data) {
        return {
          weeks: [] as WeekColumn[],
          monthLabels: [] as { weekIndex: number; label: string }[],
          rangeStart: new Date(),
          rangeEnd: new Date(),
          displayedActiveDays: 0,
          displayedTotal: 0,
        };
      }

      const fullEnd = new Date(`${data.rangeEnd}T00:00:00`);
      let end = fullEnd;
      let start: Date;

      if (range === 'current') {
        start = new Date(`${data.rangeStart}T00:00:00`);
      } else {
        // Khung 365 ngày liền trước khung hiện tại.
        end = addDays(new Date(`${data.rangeStart}T00:00:00`), -1);
        start = addDays(end, -364);
      }

      const w = buildWeeks(start, end);
      const labels = monthLabelColumns(w, start);

      let activeDays = 0;
      let total = 0;
      for (const week of w) {
        for (const day of week.days) {
          if (isAfter(day, end)) continue;
          const key = format(day, 'yyyy-MM-dd');
          const c = countByDate.get(key) ?? 0;
          if (c > 0) {
            activeDays += 1;
            total += c;
          }
        }
      }

      return {
        weeks: w,
        monthLabels: labels,
        rangeStart: start,
        rangeEnd: end,
        displayedActiveDays: activeDays,
        displayedTotal: total,
      };
    }, [data, range, countByDate]);

  function handleCellEnter(
    e: React.MouseEvent<HTMLDivElement>,
    day: Date,
    count: number,
  ) {
    const wrapRect = gridWrapRef.current?.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();
    if (!wrapRect) return;
    setTooltip({
      x: cellRect.left - wrapRect.left + CELL / 2,
      y: cellRect.top - wrapRect.top,
      date: day,
      count,
    });
  }

  function handleCellLeave() {
    setTooltip(null);
  }

  const gridWidthPx = weeks.length * STEP;

  return (
    <div className="card card-activity">
      <div className="activity-header">
        <div className="activity-header-left">
          {loading ? (
            <div className="activity-skeleton-line activity-skeleton-line--title" />
          ) : (
            <span className="activity-count">
              {(displayedTotal ?? 0).toLocaleString('en-US')}
            </span>
          )}
          <span className="activity-count-label">
            {range === 'current'
              ? 'submissions in the past one year'
              : 'submissions that year'}
            <span
              className="tooltip-wrap activity-info-icon"
              aria-label="Số bài đã nộp (kể cả chưa Accepted), tính theo ngày tạo submission."
            >
              <span aria-hidden="true">ⓘ</span>
              <span className="tooltip-box activity-info-tooltip">
                Tính theo tổng số lần nộp bài (Accepted hoặc chưa), nhóm theo
                ngày.
              </span>
            </span>
          </span>
        </div>

        <div className="activity-header-right">
          <span className="activity-meta">
            Total active days:{' '}
            <strong>{loading ? '—' : displayedActiveDays}</strong>
          </span>
          <span className="activity-meta">
            Max streak: <strong>{loading ? '—' : (data?.maxStreak ?? 0)}</strong>
          </span>

          <div className="activity-range-select">
            <button
              type="button"
              className="activity-range-btn"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
            >
              {range === 'current' ? 'Current' : 'Last year'}
              <span className="activity-range-caret" aria-hidden="true">
                ▾
              </span>
            </button>
            {menuOpen && (
              <div className="activity-range-menu">
                <button
                  type="button"
                  className={`activity-range-option${range === 'current' ? ' is-active' : ''
                    }`}
                  onMouseDown={() => handleRangeChange('current')}
                >
                  Current
                </button>
                <button
                  type="button"
                  className={`activity-range-option${range === 'last' ? ' is-active' : ''
                    }`}
                  onMouseDown={() => handleRangeChange('last')}
                >
                  Last year
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {errored ? (
        <div className="activity-empty-state">
          Không tải được dữ liệu hoạt động. Hãy thử làm vài bài trong{' '}
          <button
            type="button"
            className="activity-inline-link"
            onClick={() => navigate('/practice')}
          >
            Practice
          </button>{' '}
          rồi quay lại đây nhé.
        </div>
      ) : (
        <div className="activity-scroll" ref={gridWrapRef}>
          <div
            className="activity-grid-inner"
            style={{ width: `${gridWidthPx + 4}px` }}
          >
            <div className="activity-months-row">
              {monthLabels.map(({ weekIndex, label }) => (
                <span
                  key={`${weekIndex}-${label}`}
                  className="activity-month-label"
                  style={{ left: `${weekIndex * STEP}px` }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="activity-body-row">
              <div className="activity-day-labels">
                {DAY_LABELS.map((label, i) => (
                  <span key={i} className="activity-day-label">
                    {label}
                  </span>
                ))}
              </div>

              <div className="activity-columns">
                {loading
                  ? Array.from({ length: 53 }).map((_, wi) => (
                    <div key={wi} className="activity-week-col">
                      {Array.from({ length: 7 }).map((_, di) => (
                        <div
                          key={di}
                          className="activity-cell activity-cell--skeleton"
                        />
                      ))}
                    </div>
                  ))
                  : weeks.map((week, wi) => (
                    <div key={wi} className="activity-week-col">
                      {week.days.map((day, di) => {
                        const outOfRange =
                          isAfter(day, rangeEnd) ||
                          (di === 0 && isAfter(rangeStart, day));
                        if (outOfRange) {
                          return (
                            <div
                              key={di}
                              className="activity-cell activity-cell--empty"
                            />
                          );
                        }
                        const key = format(day, 'yyyy-MM-dd');
                        const count = countByDate.get(key) ?? 0;
                        const level = levelForCount(count);
                        const isCurrentMonth = isSameMonth(day, day);
                        return (
                          <div
                            key={di}
                            className="activity-cell"
                            data-level={level}
                            style={
                              isCurrentMonth ? undefined : { opacity: 0.9 }
                            }
                            onMouseEnter={(e) =>
                              handleCellEnter(e, day, count)
                            }
                            onMouseLeave={handleCellLeave}
                            onFocus={(e) =>
                              handleCellEnter(
                                e as unknown as React.MouseEvent<HTMLDivElement>,
                                day,
                                count,
                              )
                            }
                            onBlur={handleCellLeave}
                            tabIndex={0}
                            role="button"
                            aria-label={`${format(day, 'dd/MM/yyyy')}: ${count} submission${count === 1 ? '' : 's'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>

            {tooltip && (
              <div
                className="activity-tooltip"
                style={{
                  left: `${tooltip.x}px`,
                  top: `${tooltip.y}px`,
                }}
              >
                <strong>
                  {tooltip.count} submission{tooltip.count === 1 ? '' : 's'}
                </strong>
                <span>{format(tooltip.date, 'EEEE, dd MMM yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="activity-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className="activity-cell" data-level={lvl} />
        ))}
        <span>More</span>
        <button
          type="button"
          className="activity-legend-link"
          onClick={() => navigate('/practice')}
        >
          Go practice →
        </button>
      </div>
    </div>
  );
}

export default ActivityHeatmap;