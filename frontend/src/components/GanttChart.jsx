// Color palette for task bars
const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#f97316",
  "#14b8a6",
];

export default function GanttChart({ tasks }) {
  // Only show tasks that have been scheduled (have earliestStart & endDay)
  const scheduled = tasks.filter(
    (t) => t.earliestStart !== null && t.endDay !== null,
  );

  if (scheduled.length === 0) {
    return (
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>📊 Gantt Chart</h2>
        <div className="empty-state">
          Click "Calculate Schedule" to generate the Gantt chart.
        </div>
      </div>
    );
  }

  // Find the total number of days for the X-axis
  const totalDays = Math.max(...scheduled.map((t) => t.endDay)); //Total project duration
  const DAY_WIDTH = 40; // pixels per day

  // Create day markers for the header (0, 1, 2 ... totalDays)
  const dayMarkers = Array.from({ length: totalDays + 1 }, (_, i) => i);

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h2>📊 Gantt Chart</h2>

      <div className="gantt-wrapper">
        <div className="gantt-container">
          {/* ── X-AXIS HEADER ── */}
          <div className="gantt-header">
            {dayMarkers.map((day) => (
              <div
                key={day}
                className="gantt-day-label"
                style={{ width: DAY_WIDTH }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* ── TASK ROWS ── */}
          {scheduled.map((task, index) => {
            const barLeft = task.earliestStart * DAY_WIDTH; //bar start
            const barWidth = task.duration * DAY_WIDTH;    //length
            const color = COLORS[index % COLORS.length];  //%-keep cycling colours from COLORS arr

            return (
              <div className="gantt-row" key={task.taskId}>
                {/* Task Name Label */}
                <div className="gantt-label" title={task.name}>
                  {task.name}
                </div>

                {/* Track where the bar sits */}
                <div
                  className="gantt-track"
                  style={{ width: totalDays * DAY_WIDTH }}
                >
                  {/* Grid lines for each day */}
                  {dayMarkers.map((day) => (
                    <div
                      key={day}
                      className="gantt-grid-line"
                      style={{ left: day * DAY_WIDTH }}
                    />
                  ))}

                  {/* The actual Gantt bar */}
                  <div
                    className="gantt-bar"
                    title={`Day ${task.earliestStart} → ${task.endDay} (${task.duration}d)`}
                    style={{
                      left: barLeft,
                      width: barWidth,
                      background: `linear-gradient(135deg, ${color}cc, ${color})`,
                      border: `1px solid ${color}`,
                      boxShadow: `0 0 10px ${color}44`,
                      minWidth: 30,
                    }}
                  >
                    {barWidth > 50
                      ? `D${task.earliestStart}–${task.endDay}`
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LEGEND ── */}   
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {scheduled.map((task, index) => (
          <div
            key={task.taskId}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: COLORS[index % COLORS.length],
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
              {task.name} (Day {task.earliestStart}–{task.endDay})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
