
import { Router } from "express";
import upload from "../utils/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    createPostController,
    getPostWithLikesController,

    // Comment controllers
    createCommentController,
    updateCommentController,
    deleteCommentController,
    getPostCommentsController,

    // Like controllers
    toggleLikeController,
    getPostLikesController
} from "../controllers/post.controller.js";

const postRouter = Router();

// Post routes
postRouter.post("/", authMiddleware, upload.single("image"), createPostController);
postRouter.get("/:id", authMiddleware, getPostWithLikesController);

// Like routes
postRouter.post("/:postId/like", authMiddleware, toggleLikeController);
postRouter.get("/:postId/likes", authMiddleware, getPostLikesController);

// Comment routes
postRouter.post("/:postId/comments", authMiddleware, createCommentController);
postRouter.put("/comments/:commentId", authMiddleware, updateCommentController);
postRouter.delete("/comments/:commentId", authMiddleware, deleteCommentController);
postRouter.get("/:postId/comments", authMiddleware, getPostCommentsController);

export default postRouter;
