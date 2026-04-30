# 🗂 Project Planner

> A full-stack MERN application to plan projects, manage task dependencies, auto-calculate schedules using topological sorting, and visualise the timeline as a Gantt chart.

![Stack](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb) ![Stack](https://img.shields.io/badge/Express.js-Node.js-black?logo=express) ![Stack](https://img.shields.io/badge/React-Vite-blue?logo=react)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Scheduling Algorithm](#-scheduling-algorithm)
- [Data Model](#-data-model)
- [Sample Data](#-sample-data)

---

## ✨ Features

- **Add tasks** — give each task a name, duration in days, and a list of dependency task IDs
- **Auto-schedule** — one click calculates the earliest start and end day for every task using Kahn's BFS topological sort
- **Gantt chart** — tasks appear as colour-coded horizontal bars on a day timeline
- **Circular dependency detection** — the API rejects task sets that would create an infinite loop
- **Seed data** — load the 4 sample tasks from the assignment spec instantly
- **Delete tasks** — remove any task from the list
- All data persists in **MongoDB Atlas** (cloud database)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB Atlas + Mongoose |
| Backend | Node.js + Express.js |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
project-planner/
│
├── backend/
│   ├── models/
│   │   └── Task.js          # Mongoose schema — taskId, name, duration, dependencies, earliestStart, endDay
│   ├── routes/
│   │   └── tasks.js         # All API route handlers
│   ├── server.js            # Express app + MongoDB connection
│   ├── .env                 # Secret config (never commit this)
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TaskForm.jsx   # Form to create a new task
    │   │   ├── TaskList.jsx   # Task cards + Calculate Schedule button
    │   │   └── GanttChart.jsx # SVG Gantt bar visualisation
    │   ├── App.jsx            # Root component — state + layout
    │   ├── App.css            # Global dark theme styles
    │   └── main.jsx           # React entry point
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas account (free tier works)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/project-planner.git
cd project-planner
```

---

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder (see [Environment Variables](#-environment-variables) below), then start the server:

```bash
npm run dev
```

Expected output:

```
✅ Connected to MongoDB successfully!
🚀 Server running on http://localhost:5000
```

---

### 3. Set up the frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 🔐 Environment Variables

Create a file called `.env` inside the `backend/` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/project_planner?retryWrites=true&w=majority
PORT=5000
```

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/tasks`

---

### `GET /`
Fetch all tasks sorted by `taskId`.

**Response `200`**
```json
[
  {
    "taskId": 1,
    "name": "Design",
    "duration": 3,
    "dependencies": [],
    "earliestStart": 0,
    "endDay": 3
  }
]
```

---

### `POST /`
Create a new task.

**Request body**
```json
{
  "taskId": 2,
  "name": "Frontend",
  "duration": 4,
  "dependencies": [1]
}
```

**Response `201`** — the saved task document.

**Errors**
- `400` — missing required fields
- `400` — taskId already exists

---

### `DELETE /:taskId`
Delete a task by its `taskId`.

**Response `200`**
```json
{ "message": "Task deleted successfully." }
```

---

### `POST /seed`
Clears all tasks and inserts the 4 sample tasks from the assignment spec.

**Response `201`**
```json
{ "message": "Seeded successfully!", "tasks": [...] }
```

---

### `POST /schedule`
Calculates the schedule for all tasks using topological sort and saves `earliestStart` and `endDay` back to MongoDB.

**Response `200`**
```json
{
  "message": "Schedule calculated successfully!",
  "schedule": [
    { "taskId": 1, "name": "Design",   "earliestStart": 0, "endDay": 3  },
    { "taskId": 2, "name": "Frontend", "earliestStart": 3, "endDay": 7  },
    { "taskId": 3, "name": "Backend",  "earliestStart": 3, "endDay": 8  },
    { "taskId": 4, "name": "Testing",  "earliestStart": 8, "endDay": 10 }
  ]
}
```

**Errors**
- `400` — no tasks in database
- `400` — circular dependency detected

---

## 🧠 Scheduling Algorithm

The schedule is calculated in `routes/tasks.js` using **Kahn's Algorithm** — a BFS-based topological sort.

### Rules

| Rule | Detail |
|------|--------|
| No dependencies | Task starts on **Day 0** |
| Has dependencies | `earliestStart = max(endDay of ALL dependencies)` |
| End day | `endDay = earliestStart + duration` |
| Circular deps | Returns `400` error |

### How it works — step by step

```
1. Fetch all tasks from MongoDB

2. Build a map:  { taskId → task object }

3. Count in-degrees:  { taskId → number of dependencies }

4. Seed the queue with every task whose in-degree = 0
   → set their earliestStart = 0

5. BFS loop (while queue is not empty):
     a. Pop a task off the queue
     b. Calculate:  endDay = earliestStart + duration
     c. For each task that depends on this one:
          earliestStart = max(child's current start, this task's endDay)
          inDegree[child]--
          if inDegree[child] === 0  →  push child to queue

6. Cycle check:
     if tasks processed ≠ total tasks  →  circular dependency error

7. Save updated earliestStart + endDay to MongoDB for every task
```

---

## 🗄 Data Model

`models/Task.js` — Mongoose schema

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `taskId` | Number | ✅ | Unique identifier |
| `name` | String | ✅ | Auto-trimmed |
| `duration` | Number | ✅ | Minimum 1 day |
| `dependencies` | [Number] | — | Array of taskIds; defaults to `[]` |
| `earliestStart` | Number | — | `null` until `/schedule` is called |
| `endDay` | Number | — | `null` until `/schedule` is called |
| `createdAt` | Date | — | Auto-added by Mongoose timestamps |
| `updatedAt` | Date | — | Auto-added by Mongoose timestamps |

---

## 📊 Sample Data

Loaded via the **"Load Sample Tasks"** button or `POST /api/tasks/seed`.

| Task ID | Name | Duration | Depends On | Earliest Start | End Day |
|---------|------|----------|------------|---------------|---------|
| 1 | Design | 3 days | — | Day 0 | Day 3 |
| 2 | Frontend | 4 days | Task 1 | Day 3 | Day 7 |
| 3 | Backend | 5 days | Task 1 | Day 3 | Day 8 |
| 4 | Testing | 2 days | Tasks 2 & 3 | Day 8 | Day 10 |

**Why does Testing start on Day 8?**
Testing depends on both Frontend (ends Day 7) and Backend (ends Day 8).
It must wait for the **later** of the two → `max(7, 8) = 8`.

---

## 🔒 Security Notes

- `.env` is excluded from Git via `.gitignore` — never override this
- CORS is restricted to `http://localhost:5173` only
- Input validation is handled at both the route level (required field checks) and the schema level (`min: 1` on duration, `unique: true` on taskId)

---
