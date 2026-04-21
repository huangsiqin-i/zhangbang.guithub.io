const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { initDatabase, testConnection } = require("./db/sqliteConnection");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const bondiansRouter = require("./routes/bondians");
const commentsRouter = require("./routes/comments");
const favoritesRouter = require("./routes/favorites");
const statsRouter = require("./routes/stats");
const worksRouter = require("./routes/works");
const settingsRouter = require("./routes/settings");
const mastersRouter = require("./routes/masters");
const announcementsRouter = require("./routes/announcements");
const linksRouter = require("./routes/links");
const adminLogsRouter = require("./routes/adminLogs");
const patternsRouter = require("./routes/patterns");
const userRouter = require("./routes/user");

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 全局请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('请求体:', JSON.stringify(req.body));
  next();
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('../images'));
app.use(express.static('../'));

app.get("/", (req, res) => {
  res.json({
    message: "邦典文化传承平台 - Backend server is running.",
    environment: NODE_ENV,
    docs: "Use /api/health to verify API status.",
    endpoints: {
      bondians: "/api/bondians",
      comments: "/api/comments",
      favorites: "/api/favorites",
      stats: "/api/stats",
      auth: "/api/auth"
    }
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/bondians", bondiansRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/works", worksRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/masters", mastersRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/links", linksRouter);
app.use("/api/admin/logs", adminLogsRouter);
app.use("/api/patterns", patternsRouter);
app.use("/api/user", userRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

const startServer = async () => {
  try {
    if (NODE_ENV !== "test") {
      await initDatabase();
      await testConnection();
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📍 Listening on http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
