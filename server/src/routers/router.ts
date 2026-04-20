import { Router } from "express";
import usersRouter from "./users.router.js";
import clubsRouter from "./clubs.router.js";
import clubRequestsRouter from "./club_requests.router.js";
import clubMemberRouter from "./club_members.router.js";
import eventsRouter from "./events.router.js";
import playersRouter from "./players.router.js";

const router = Router();

router.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true,
        ok: true 
    });
});

router.use("/users", usersRouter);
router.use("/clubs", clubsRouter);
router.use("/clubrequests", clubRequestsRouter);
router.use("/clubmembers", clubMemberRouter);
router.use("/events", eventsRouter);
router.use("/players", playersRouter);

export default router;