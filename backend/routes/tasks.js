const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// ─────────────────────────────────────────────
// GET /api/tasks — Fetch all tasks
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // Find all tasks, sorted by taskId ascending
    const tasks = await Task.find().sort({ taskId: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/tasks — Create a new task
// ─────────────────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const { taskId, name, duration, dependencies } = req.body;

    // Validate required fields
    if (!taskId || !name || !duration) {
      return res
        .status(400)
        .json({ error: "taskId, name, and duration are required." });
    }

    // Check if taskId already exists
    const existing = await Task.findOne({ taskId });
    if (existing) {
      return res
        .status(400)
        .json({ error: `Task with ID ${taskId} already exists.` });
    }

    // Create new task document
    const newTask = new Task({
      taskId,
      name,
      duration,
      dependencies: dependencies || [],
    });

    // Save to MongoDB
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/tasks/:taskId — Delete a task
// ─────────────────────────────────────────────
router.delete("/:taskId", async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      taskId: Number(req.params.taskId),
    });
    if (!deleted) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/tasks/seed — Seed example tasks from assignment
// ─────────────────────────────────────────────
router.post("/seed", async (req, res) => {
  try {
    // Clear existing tasks first
    await Task.deleteMany({});

    const sampleTasks = [
      { taskId: 1, name: "Design", duration: 3, dependencies: [] },
      { taskId: 2, name: "Frontend", duration: 4, dependencies: [1] },
      { taskId: 3, name: "Backend", duration: 5, dependencies: [1] },
      { taskId: 4, name: "Testing", duration: 2, dependencies: [2, 3] },
    ];

    const inserted = await Task.insertMany(sampleTasks);
    res.status(201).json({ message: "Seeded successfully!", tasks: inserted });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/tasks/schedule — Calculate schedule
//
// ALGORITHM: Topological Sort + Earliest Start Calculation
//
// Rules:
//   - Tasks with NO dependencies start at Day 0
//   - A task can start only after ALL its dependencies finish
//   - earliestStart = max(endDay of all dependencies)
//   - endDay = earliestStart + duration
// ─────────────────────────────────────────────
router.post("/schedule", async (req, res) => {
  try {
    // Step 1: Fetch all tasks from DB
    const tasks = await Task.find().sort({ taskId: 1 });

    if (tasks.length === 0) {
      return res.status(400).json({ error: "No tasks found to schedule." });
    }

    // Step 2: Build a map { taskId -> task } for quick lookup
    const taskMap = {};
    tasks.forEach((t) => {
      taskMap[t.taskId] = {
        taskId: t.taskId,
        name: t.name,
        duration: t.duration,
        dependencies: t.dependencies,
        earliestStart: null,
        endDay: null,
      };
    });

    // Step 3: Topological sort using Kahn's algorithm (BFS-based)
    // This ensures we process a task only after all its dependencies are done.

    // Build in-degree count (how many dependencies each task has)
    const inDegree = {};
    tasks.forEach((t) => {
      inDegree[t.taskId] = t.dependencies.length;
    });

    // Queue starts with all tasks that have zero dependencies
    const queue = [];
    tasks.forEach((t) => {
      if (t.dependencies.length === 0) {
        queue.push(t.taskId);
        taskMap[t.taskId].earliestStart = 0; // No deps → start on Day 0
      }
    });

    // Build reverse dependency map: who depends on me?
    const dependents = {}; // { taskId -> [taskIds that depend on me] }
    tasks.forEach((t) => {
      t.dependencies.forEach((depId) => {
        if (!dependents[depId]) dependents[depId] = [];
        dependents[depId].push(t.taskId);
      });
    });

    const processingOrder = [];

    // Process queue
    while (queue.length > 0) {
      const currentId = queue.shift(); // Take first task from queue
      const current = taskMap[currentId];

      // Calculate endDay
      current.endDay = current.earliestStart + current.duration;

      processingOrder.push(currentId);

      // For each task that depends on currentId, update their earliestStart
      if (dependents[currentId]) {
        dependents[currentId].forEach((dependentId) => {
          const dep = taskMap[dependentId];

          // earliestStart = max(current earliestStart, endDay of this dependency)
          if (
            dep.earliestStart === null ||
            dep.earliestStart < current.endDay
          ) {
            dep.earliestStart = current.endDay;
          }

          // Reduce in-degree; if 0, all dependencies processed → add to queue
          inDegree[dependentId]--;
          if (inDegree[dependentId] === 0) {
            queue.push(dependentId);
          }
        });
      }
    }

    // Step 4: Check for circular dependencies
    if (processingOrder.length !== tasks.length) {
      return res
        .status(400)
        .json({ error: "Circular dependency detected in tasks." });
    }

    // Step 5: Save the calculated schedule back to MongoDB
    const updatePromises = Object.values(taskMap).map((t) =>
      Task.findOneAndUpdate(
        { taskId: t.taskId },
        { earliestStart: t.earliestStart, endDay: t.endDay },
        { new: true },
      ),
    );
    const updatedTasks = await Promise.all(updatePromises);

    res.json({
      message: "Schedule calculated successfully!",
      schedule: updatedTasks.sort((a, b) => a.taskId - b.taskId),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
