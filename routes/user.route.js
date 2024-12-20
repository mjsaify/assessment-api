import { Router } from 'express';
import { ChangePassword, DeleteUserProfile, GetUserDetails, UpdateUserProfile, UserLogout } from '../controllers/user.controller.js';

const router = Router();

router.post("/logout", UserLogout);
router.post("/change-password", ChangePassword);
router.patch("/update-profile", UpdateUserProfile);
router.delete("/delete-profile", DeleteUserProfile);
router.get("/", GetUserDetails);

export default router;