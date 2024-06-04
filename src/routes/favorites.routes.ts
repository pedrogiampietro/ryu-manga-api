import express from "express";
import { addFavorite, getFavorites } from "../controllers/FavoritesController";

const router = express.Router();

router.post("/", addFavorite);
router.get("/", getFavorites);

export default router;
