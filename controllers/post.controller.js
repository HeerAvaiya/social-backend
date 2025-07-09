import Handler from "../utils/handler.js";
import cloudinary from "../utils/cloudinary.js";
import postService from "../services/post.service.js";

export const createPostController = Handler(async (req, res) => {
    const createdBy = req.user.id;
    const { caption } = req.body;

    if (!req.file?.path) {
        throw new Error("Image file is required");
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "social_posts",
    });

    if (!result?.secure_url || !result?.public_id) {
        throw new Error("Cloudinary upload failed");
    }

    const newPost = await postService.createPost({
        createdBy,
        caption,
        imageUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
    });

    res.status(201).json({
        error: false,
        message: "Post created successfully",
        data: newPost,
    });
});

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
