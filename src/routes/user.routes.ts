import express from "express";
import { updateUser, syncUser } from "../controllers/UserController";
import { uploadAvatars } from "../middlewares/multer";

const router = express.Router();

router.patch("/update-user", uploadAvatars.single("avatar"), updateUser);
router.post("/sync", syncUser);

export default router;
