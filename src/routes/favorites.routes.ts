import express from "express";
import {
  addFavorite,
  getFavorites,
  deleteFavorite,
} from "../controllers/FavoritesController";

const router = express.Router();

router.post("/", addFavorite);
router.get("/", getFavorites);
router.delete("/", deleteFavorite);

export default router;
