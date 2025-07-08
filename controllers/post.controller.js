import Handler from "../utils/handler.js";
import postService from "../services/post.service.js";
import likeService from "../services/like.service.js";
import commentService from "../services/comment.service.js";

// Create Post
export const createPostController = Handler(async (req, res) => {
    const createdBy = req.user.id;
    const image = req.file?.filename;
    const { caption } = req.body;

    if (!image) throw new Error("Image is required");

    const newPost = await postService.createPost({ createdBy, image, caption });

    res.status(201).json({
        error: false,
        message: "Post created successfully",
        data: newPost,
    });
});

// Get Post with Likes Info
export const getPostWithLikesController = Handler(async (req, res) => {
    const postId = req.params.id;
    const post = await postService.getPostWithLikes(postId);
    if (!post) return res.status(404).json({ error: true, message: "Post not found" });

    res.status(200).json({ error: false, data: post });
});


// Like/Unlike a Post
export const toggleLikeController = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        const result = await likeService.toggleLike(userId, postId);

        return res.status(200).json({
            success: true,
            message: result.liked ? 'Post liked successfully' : 'Post unliked successfully',
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Get users who liked a post
export const getPostLikesController = async (req, res) => {
    try {
        const postId = req.params.postId;
        const users = await likeService.getUsersWhoLikedPost(postId);

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


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

// Get Comments by Post
export const getPostCommentsController = Handler(async (req, res) => {
    const postId = req.params.postId;
    const comments = await commentService.getCommentsByPost(postId);

    res.status(200).json({
        success: true,
        data: comments,
    });
});
