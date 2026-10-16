import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import mediaRoutes from "./routes/media.routes.js";
import directDownloadRoutes from "./routes/directDownload.routes.js";
import youtubeDownloadRoutes from "./routes/youtubeDownload.routes.js";
dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.send("SnapLoad API is running!");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SnapLoad API is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SnapLoad API is running.",
  });
});
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "SnapLoad API is running",
    endpoints: {
      health: "/api/health",
      info: "/api/info",
      youtubeDownload: "/api/youtube/download",
    },
  });
});

app.use("/api", mediaRoutes);
app.use("/api/direct-media", directDownloadRoutes);
app.use("/api/youtube", youtubeDownloadRoutes);

export default app;
