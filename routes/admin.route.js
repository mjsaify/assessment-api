import { Router } from 'express';
import { GetAllUsers, UpdateUserStatus, DeleteUser } from '../controllers/admin.controller.js';

const router = Router();

router.get("/all-users", GetAllUsers);
router.patch("/update-user-status", UpdateUserStatus);
router.delete("/delete-user/:id", DeleteUser);

export default router;