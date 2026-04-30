const mongoose = require("mongoose");

// Define the schema (blueprint) for a Task document in MongoDB
const TaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: Number,
      required: true,
      unique: true, // No two tasks can have the same taskId
    },
    name: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // Duration must be at least 1 day
    },
    dependencies: {
      // Array of taskIds this task depends on
      // e.g. [1, 2] means this task starts after tasks 1 and 2 finish
      type: [Number],
      default: [],
    },
    // These are CALCULATED fields — filled in by the schedule API
    earliestStart: {
      type: Number,
      default: null, // null means not scheduled yet
    },
    endDay: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  },
);

// Export the model so other files can use it
module.exports = mongoose.model("Task", TaskSchema);
