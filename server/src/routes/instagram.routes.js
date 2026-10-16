import { Router } from "express";
import {
  inspectSocialMedia,
  downloadSocialMedia,
} from "../services/socialMedia.service.js";
const router = Router();

router.post("/info", async (req, res) => {
  try {
    if (typeof req.body?.url !== "string" || !req.body.url.trim())
      return res
        .status(400)
        .json({ success: false, message: "Instagram URL is required." });
    const media = await inspectSocialMedia(req.body.url.trim(), "instagram");
    res.json({ success: true, media });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: err.message || "Unable to inspect this link.",
      });
  }
});

router.get("/download", async (req, res) => {
  try {
    await downloadSocialMedia(
      typeof req.query.url === "string" ? req.query.url : "",
      "instagram",
      res,
    );
  } catch (err) {
    if (!res.headersSent)
      res
        .status(400)
        .json({ success: false, message: err.message || "Download failed." });
  }
});
export default router;
