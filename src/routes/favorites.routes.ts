import express from "express";
import {
  addFavorite,
  getFavorites,
  deleteFavorite,
} from "../controllers/FavoritesController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, addFavorite);
router.get("/", authMiddleware, getFavorites);
router.delete("/", authMiddleware, deleteFavorite);

export default router;
