const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

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

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('../images'));
app.use(express.static('../'));

app.get("/", (req, res) => {
  res.json({
    message: "邦典文化传承平台 - Backend server is running.",
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
