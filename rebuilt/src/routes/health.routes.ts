
import { Router } from "express";
import {prisma} from "../lib/prisma.js"

const router = Router();

router.get("/live", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      status: "ok",
      message: "Database is connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "error",
      message: "Database is not connected",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

