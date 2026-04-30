import axios from "axios";

const API = "http://localhost:5000/api/tasks";

export default function TaskList({ tasks, onRefresh, onMessage }) {
  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API}/${taskId}`);
      onMessage({ type: "success", text: `Task ${taskId} deleted.` });
      onRefresh();
    } catch (err) {
      onMessage({ type: "error", text: "Failed to delete task." });
    }
  };

  const handleSchedule = async () => {
    try {
      const res = await axios.post(`${API}/schedule`);
      onMessage({ type: "success", text: res.data.message });
      onRefresh();
    } catch (err) {
      onMessage({
        type: "error",
        text: err.response?.data?.error || "Scheduling failed.",
      });
    }
  };

  return (
    <div className="card">
      <h2>📋 Tasks</h2>

      <div className="btn-actions" style={{ marginBottom: "1rem" }}>
        <button className="btn btn-success" onClick={handleSchedule}>
          ⚡ Calculate Schedule
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          No tasks yet. Add a task or load sample data.
        </div>
      ) : (
        tasks.map((task) => (
          <div className="task-item" key={task.taskId}>
            <div className="task-info">
              <div className="task-name">
                #{task.taskId} — {task.name}
              </div>
              <div className="task-meta">
                {task.duration}d &nbsp;|&nbsp; deps:{" "}
                {task.dependencies.length > 0
                  ? task.dependencies.join(", ")
                  : "none"}
              </div>
            </div>

            {task.earliestStart !== null && task.endDay !== null ? (
              <div className="task-schedule">
                Day {task.earliestStart} → {task.endDay}
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                not scheduled
              </div>
            )}

            <button
              className="btn btn-danger"
              onClick={() => handleDelete(task.taskId)}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}
