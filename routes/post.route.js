import { Router } from "express";
import {
    createPostController,
    getPostWithLikesController,
    toggleLikeController,
    getPostLikesController,
    createCommentController,
    updateCommentController,
    deleteCommentController,
    getPostCommentsController
} from "../controllers/post.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../utils/upload.js";

const postRouter = Router();

// Posts
postRouter.post("/", authMiddleware, upload.single("image"), createPostController);
postRouter.get("/:id", authMiddleware, getPostWithLikesController);

// Likes
postRouter.post("/:postId/like", authMiddleware, toggleLikeController);
postRouter.get("/:postId/likes", authMiddleware, getPostLikesController);

// Comments
postRouter.post("/:postId/comments", authMiddleware, createCommentController);
postRouter.put("/comments/:commentId", authMiddleware, updateCommentController);
postRouter.delete("/comments/:commentId", authMiddleware, deleteCommentController);
postRouter.get("/:postId/comments", authMiddleware, getPostCommentsController);

export default postRouter;
    