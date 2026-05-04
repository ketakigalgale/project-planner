import { useState } from "react";
import axios from "axios";

const API = "https://project-planner-tcbe.onrender.com/api/tasks";

export default function TaskForm({ onTaskAdded, onMessage }) {//Props Destructuring
  const [form, setForm] = useState({
    taskId: "",
    name: "",
    duration: "",
    dependencies: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.taskId || !form.name || !form.duration) {
      onMessage({
        type: "error",
        text: "Task ID, Name, and Duration are required.",
      });
      return;
    }

    // Parse dependencies string "1, 2" → [1, 2]
    const deps = form.dependencies
      ? form.dependencies
          .split(",")
          .map((d) => parseInt(d.trim()))
          .filter((d) => !isNaN(d))
      : [];

    try {
      await axios.post(API, {
        taskId: parseInt(form.taskId),
        name: form.name.trim(),
        duration: parseInt(form.duration),
        dependencies: deps,
      });
      onMessage({ type: "success", text: `Task "${form.name}" added!` }); //Showmessage
      setForm({ taskId: "", name: "", duration: "", dependencies: "" }); //clear input field
      onTaskAdded(); //Refresh task list - Fetchtask
    } catch (err) {
      onMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to add task.",
      });
    }
  };

  const handleSeed = async () => {
    try {
      await axios.post(`${API}/seed`);
      onMessage({ type: "success", text: "Sample tasks loaded!" });
      onTaskAdded();
    } catch (err) {
      onMessage({ type: "error", text: "Failed to seed tasks." });
    }
  };

  return (
    <div className="card">
      <h2>➕ Add Task</h2>

      <div className="form-group">
        <label>Task ID</label>
        <input
          name="taskId"
          type="number"
          placeholder="e.g. 1"
          value={form.taskId}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Task Name</label>
        <input
          name="name"
          type="text"
          placeholder="e.g. Design"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Duration (days)</label>
        <input
          name="duration"
          type="number"
          placeholder="e.g. 3"
          value={form.duration}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Dependencies (comma-separated IDs)</label>
        <input
          name="dependencies"
          type="text"
          placeholder="e.g. 1, 2 (leave empty for none)"
          value={form.dependencies}
          onChange={handleChange}
        />
      </div>

      <button
        className="btn btn-primary"
        style={{ marginBottom: "0.75rem" }}
        onClick={handleSubmit}
      >
        Add Task
      </button>

      <button
        className="btn btn-warning"
        style={{ width: "100%" }}
        onClick={handleSeed}
      >
        Load Sample Tasks
      </button>
    </div>
  );
}
