import { useState, useEffect } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import GanttChart from "./components/GanttChart";
import "./App.css";

const API = "https://project-planner-tcbe.onrender.com/";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState(null);

  // Fetch all tasks from the backend
  const fetchTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (err) {
      showMessage({ type: "error", text: "Cannot connect to backend." });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Show a temporary notification message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <div className="header">
        <h1>🗂 Project Planner</h1>
        <p>MERN Stack · Gantt Chart · Dependency Scheduling</p>
      </div>

      {/* ── ALERT ── */}
      {message && (
        <div
          className={`alert alert-${message.type === "error" ? "error" : "success"}`}
        >
          {message.text}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid">
        <TaskForm onTaskAdded={fetchTasks} onMessage={showMessage} />
        <TaskList
          tasks={tasks}
          onRefresh={fetchTasks}
          onMessage={showMessage}
        />
      </div>

      {/* ── GANTT CHART ── */}
      <GanttChart tasks={tasks} />
    </div>
  );
}
