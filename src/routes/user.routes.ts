import express from "express";
import { updateUser } from "../controllers/UserController";

const router = express.Router();

router.patch("/update-user", updateUser);

export default router;
