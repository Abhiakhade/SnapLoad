import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import mediaRoutes from "./routes/media.routes.js";
import directDownloadRoutes from "./routes/directDownload.routes.js";
import youtubeDownloadRoutes from "./routes/youtubeDownload.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";
import pinterestRoutes from "./routes/pinterest.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = [
  "https://downloadytvideo.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
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

app.use("/api/instagram", instagramRoutes);
app.use("/api/pinterest", pinterestRoutes);

export default app;
