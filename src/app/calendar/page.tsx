"use client";

import { useMemo, useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { PageHeader } from "@/components/ui";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function CalendarPage() {
  const { visibleTasks } = useCrm();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const items: { date: Date; current: boolean }[] = [];

    for (let i = startOffset; i > 0; i -= 1) {
      items.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), 1 - i), current: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), day), current: true });
    }
    while (items.length % 7 !== 0) {
      const last = items[items.length - 1].date;
      items.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
        current: false,
      });
    }
    return items;
  }, [cursor]);

  const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(cursor);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={label}
        action={
          <div className="toolbar">
            <button
              className="btn outline"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              Previous
            </button>
            <button className="btn outline" onClick={() => setCursor(startOfMonth(new Date()))}>
              Today
            </button>
            <button
              className="btn outline"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>
        }
      />

      <div className="calendar-grid" style={{ marginBottom: 8 }}>
        {weekdays.map((day) => (
          <div key={day} style={{ padding: "0 10px" }} className="muted-kind">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map(({ date, current }) => {
          const dayTasks = visibleTasks.filter((task) => new Date(task.dueAt).toDateString() === date.toDateString());
          return (
            <div key={date.toISOString()} className={`cal-cell ${current ? "" : "muted"}`}>
              <strong>{date.getDate()}</strong>
              {dayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="cal-event">
                  {task.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
