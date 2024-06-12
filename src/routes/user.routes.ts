import express from "express";
import { updateUser } from "../controllers/UserController";
import { uploadAvatars } from "../middlewares/multer";

const router = express.Router();

router.patch("/update-user", uploadAvatars.single("avatar"), updateUser);

export default router;
