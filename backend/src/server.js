
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const clubRoutes = require("./routes/clubRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/clubs", clubRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SCMS Backend is running!",
    data: {
      project: "Student Club Management System",
      status: "OK",
    },
  });
});

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `SCMS Backend is running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start SCMS Backend:", error.message);
    process.exit(1);
  }
};

startServer();
