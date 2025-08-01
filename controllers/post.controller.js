import Handler from "../utils/handler.js";
import cloudinary from "../utils/cloudinary.js";
import postService from "../services/post.service.js";
import fs from "fs";

export const createPostController = async (req, res) => {
    try {
        const { caption } = req.body;
        const createdBy = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social_posts"
        });

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const imageUrl = result.secure_url;
        const cloudinaryPublicId = result.public_id;

        const newPost = await postService.createPost({
            createdBy,
            caption,
            imageUrl,
            cloudinaryPublicId
        });

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        console.error("Post creation error:", error);
        res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
};

export const updatePostImageController = async (req, res) => {
    let tempPublicId = null;

    try {
        const { postId } = req.params;
        const { caption } = req.body;
        const userId = req.user.id;

        const post = await postService.getPostById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });
        if (post.createdBy !== userId)
            return res.status(403).json({ error: "You are not authorized to update this post" });

        if (!req.file) return res.status(400).json({ error: "Image file is required" });

        if (post.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(post.cloudinaryPublicId);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social_posts",
        });

        tempPublicId = result.public_id;

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const updatedPost = await postService.updatePostImage(postId, {
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            caption: caption ?? post.caption,
        });

        res.status(200).json({
            message: "Post image and caption updated successfully",
            post: updatedPost,
        });
    } catch (error) {
        if (tempPublicId) {
            try {
                await cloudinary.uploader.destroy(tempPublicId);
            } catch (e) {
                console.error("Cloudinary rollback failed:", e.message);
            }
        }

        console.error("Post image update error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllPostsController = Handler(async (req, res) => {
    const posts = await postService.getAllPosts();
    res.status(200).json({ success: true, data: posts });
});

export const getUserPostsController = Handler(async (req, res) => {
    const userId = req.params.userId;
    const posts = await postService.getPostsByUserId(userId);
    res.status(200).json({ success: true, data: posts });
});

export const deletePostController = Handler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await postService.getPostById(postId);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    if (post.createdBy !== userId) {
        return res.status(403).json({ error: "You are not authorized to delete this post" });
    }

    if (post.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(post.cloudinaryPublicId);
    }

    await postService.deletePost(postId);

    res.status(200).json({ message: "Post deleted successfully" });
});

export const getPostWithLikesController = Handler(async (req, res) => {
    const postId = req.params.id;
    const post = await postService.getPostWithLikes(postId);
    if (!post) return res.status(404).json({ error: true, message: "Post not found" });

    res.status(200).json({ error: false, data: post });
});

export const toggleLikeController = Handler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    const result = await postService.toggleLike(userId, postId);

    res.status(200).json({
        success: true,
        message: result.liked ? "Post liked successfully" : "Post unliked successfully",
    });
});

export const getPostLikesController = Handler(async (req, res) => {
    const postId = req.params.postId;
    const users = await postService.getUsersWhoLikedPost(postId);

    res.status(200).json({
        success: true,
        data: users,
    });
});

export const createCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) throw new Error("Comment text is required");

    const comment = await postService.addComment({ userId, postId, text });
    console.log(comment)

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
});


export const deleteCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    await postService.deleteComment(commentId, userId);

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
});

export const updateCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text) throw new Error("Comment text is required");

    const updatedComment = await postService.updateComment(commentId, userId, text);

    res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
    });
});

export const getPostCommentsController = Handler(async (req, res) => {
    const postId = req.params.postId;
    const comments = await postService.getCommentsByPost(postId);

    res.status(200).json({
        success: true,
        data: comments,
    });
});
