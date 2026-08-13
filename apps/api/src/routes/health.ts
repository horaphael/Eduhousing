import { Router } from "express";
import { pool } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error" });
  }
});
