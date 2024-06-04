import express from "express";
import {
  getLastRead,
  saveLastRead,
} from "../controllers/LastWatchedController";

const router = express.Router();

router.post("/", saveLastRead);
router.get("/", getLastRead);

export default router;
