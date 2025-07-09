import Handler from "../utils/handler.js";
import cloudinary from "../utils/cloudinary.js";
import postService from "../services/post.service.js";
import fs from "fs";



// Create Post
export const createPostController = async (req, res) => {
    try {
        const { caption } = req.body;
        const createdBy = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social_posts"
        });

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const imageUrl = result.secure_url;
        const cloudinaryPublicId = result.public_id;

        // Save post to DB
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




// Get Post with Likes
export const getPostWithLikesController = Handler(async (req, res) => {
    const postId = req.params.id;
    const post = await postService.getPostWithLikes(postId);
    if (!post) return res.status(404).json({ error: true, message: "Post not found" });

    res.status(200).json({ error: false, data: post });
});

// Like / Unlike Post
export const toggleLikeController = Handler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    const result = await likeService.toggleLike(userId, postId);

    res.status(200).json({
        success: true,
        message: result.liked ? "Post liked successfully" : "Post unliked successfully",
    });
});

// Get Users Who Liked Post
export const getPostLikesController = Handler(async (req, res) => {
    const postId = req.params.postId;
    const users = await likeService.getUsersWhoLikedPost(postId);

    res.status(200).json({
        success: true,
        data: users,
    });
});

// Add Comment
export const createCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { text } = req.body;

    if (!text) throw new Error("Comment text is required");

    const comment = await commentService.addComment({ userId, postId, text });

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
});

// Delete Comment
export const deleteCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    await commentService.deleteComment(commentId, userId);

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
});

// Update Comment
export const updateCommentController = Handler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text) throw new Error("Comment text is required");

    const updatedComment = await commentService.updateComment(commentId, userId, text);

    res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
    });
});

// Get Comments for Post
export const getPostCommentsController = Handler(async (req, res) => {
    const postId = req.params.postId;
    const comments = await commentService.getCommentsByPost(postId);

    res.status(200).json({
        success: true,
        data: comments,
    });
});
