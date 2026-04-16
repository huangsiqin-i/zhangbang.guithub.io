const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const worksRouter = require("./routes/works");

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running.",
    docs: "Use /api/health to verify API status."
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/works", worksRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
