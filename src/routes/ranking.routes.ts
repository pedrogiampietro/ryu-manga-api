import express from "express";
import { highscoresStats } from "../controllers/RankingController";

const router = express.Router();

router.get("/highscores-stats", highscoresStats);

export default router;
