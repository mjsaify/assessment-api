import { Router } from "express";
import userRouter from "./user.route.js";
import adminRouter from "./admin.route.js";
import { ForgotPasswordRequest, ResetPassword, UserLogin, UserSignup } from "../controllers/user.controller.js";
import { auth, authorization } from "../middleware/auth.js";

const router = Router();

// PRIVATE ROUTES
router.use("/user", auth, userRouter);
router.use("/admin", auth, authorization("admin"), adminRouter);


// PUBLIC ROUTES
router.post("/signup", UserSignup);
router.post("/login", UserLogin);
router.post("/forgot-password", ForgotPasswordRequest);
router.post("/reset-password", ResetPassword);

export default router;