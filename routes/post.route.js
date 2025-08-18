import { Router } from "express";
import {
    createPostController,
    updatePostImageController,
    getPostWithLikesController,
    getAllPostsController,
    getUserPostsController,
    deletePostController,
    toggleLikeController,
    getPostLikesController,
    createCommentController,
    updateCommentController,
    deleteCommentController,
    getPostCommentsController,
    getFeedPostsController,
    // getPostByIdController
} from "../controllers/post.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../utils/upload.js";

const postRouter = Router();

postRouter.get("/feed", authMiddleware, getFeedPostsController);

postRouter.post("/", authMiddleware, upload.single("image"), createPostController);
postRouter.get("/:id", authMiddleware, getPostWithLikesController);
postRouter.put('/:postId/image', authMiddleware, upload.single("image"), updatePostImageController);
postRouter.get("/", authMiddleware, getAllPostsController);
postRouter.get("/user/:userId", authMiddleware, getUserPostsController);
postRouter.delete("/:postId", authMiddleware, deletePostController);

postRouter.post("/:postId/like", authMiddleware, toggleLikeController);
postRouter.get("/:postId/likes", authMiddleware, getPostLikesController);

postRouter.post("/:postId/comments", authMiddleware, createCommentController);
postRouter.put("/comments/:commentId", authMiddleware, updateCommentController);
postRouter.delete("/comments/:commentId", authMiddleware, deleteCommentController);
postRouter.get("/:postId/comments", authMiddleware, getPostCommentsController);

// postRouter.get("/:postId", authMiddleware, getPostByIdController);

export default postRouter;