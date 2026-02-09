import express from "express";
import {authenticateUser} from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    joinSession,
    startSession,
    endSession
} from "../controllers/sessions.controllers.js";


const router = express.Router();

router.post("/create", authenticateUser, checkRole("host"), createSession);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.put("/:id", authenticateUser, checkRole("host"), updateSession);
router.delete("/:id", authenticateUser, checkRole("host"), deleteSession);
router.post("/:id/join", authenticateUser, joinSession);
router.post("/:id/start", startSession);
router.post("/:id/end", endSession);

export default router;