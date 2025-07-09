import { Router } from "express";
import upload from "../utils/upload.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    // User Profile
    getUserMeController,
    updateUserMeController,
    deleteUserMeController,
    createProfileImageController,
    updateProfileImageController,
    deleteProfileImageController,
    togglePrivacyController,
    forgotPasswordController,
    resetPasswordController,

    // Follow System
    sendFollowRequestController,
    acceptFollowRequestController,
    rejectFollowRequestController,
    unfollowUserController,
    getFollowersController,
    getFollowingController,
} from "../controllers/user.controller.js";

const userRouter = Router();

// User Profile Routes
userRouter.get("/me", authMiddleware, getUserMeController);
userRouter.put("/me", authMiddleware, updateUserMeController);
userRouter.put("/me/privacy", authMiddleware, togglePrivacyController);
userRouter.delete("/me", authMiddleware, deleteUserMeController);
userRouter.post("/profile/image", authMiddleware, upload.single("image"), createProfileImageController);
userRouter.put("/profile/image", authMiddleware, upload.single("image"), updateProfileImageController);
userRouter.delete("/profile/image", authMiddleware, deleteProfileImageController);


// Follow System Routes
userRouter.post("/:userId/follow", authMiddleware, sendFollowRequestController);
userRouter.put("/:followerId/accept", authMiddleware, acceptFollowRequestController);
userRouter.put("/:followerId/reject", authMiddleware, rejectFollowRequestController);
userRouter.delete("/:userId/unfollow", authMiddleware, unfollowUserController);
userRouter.get("/:userId/followers", authMiddleware, getFollowersController);
userRouter.get("/:userId/following", authMiddleware, getFollowingController);

userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/reset-password/:token", resetPasswordController);

export default userRouter;
