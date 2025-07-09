import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

const createPost = async ({ createdBy, caption, imageUrl, cloudinaryPublicId }) => {
    console.log("Creating post with:", { createdBy, caption, imageUrl, cloudinaryPublicId });

    return await Post.create({
        createdBy,
        caption,
        imageUrl,
        cloudinaryPublicId,
    });
};


const getPostWithLikes = async (postId) => {
    return await Post.findByPk(postId, {
        include: [
            {
                model: Like,
                as: "likes",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "username", "email"],
                    },
                ],
            },
        ],
    });
};


// LIKE 
const toggleLike = async (userId, postId) => {
    const existingLike = await Like.findOne({ where: { userId, postId } });
    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    if (existingLike) {
        await existingLike.destroy();
        post.likesCount = Math.max((post.likesCount || 0) - 1, 0);
        await post.save();
        return { liked: false };
    } else {
        await Like.create({ userId, postId });
        post.likesCount = (post.likesCount || 0) + 1;
        await post.save();
        return { liked: true };
    }
};

const getUsersWhoLikedPost = async (postId) => {
    const likes = await Like.findAll({
        where: { postId },
        include: [{
            model: User,
            attributes: ['id', 'username', 'email']
        }]
    });
    return likes.map(like => like.User);
};

// COMMENT 
const addComment = async ({ text, userId, postId }) => {
    const comment = await Comment.create({ text, userId, postId });

    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    console.log("Incremented commentCount:", post.commentCount);
    return comment;
};

const updateComment = async (commentId, userId, newText) => {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) throw new Error("Comment not found or unauthorized");

    comment.text = newText;
    await comment.save();
    return comment;
};

const deleteComment = async (commentId, userId) => {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) throw new Error("Comment not found or unauthorized");

    const postId = comment.postId;
    await comment.destroy();

    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    post.commentCount = Math.max((post.commentCount || 1) - 1, 0);
    await post.save();

    console.log("Decremented commentCount:", post.commentCount);
    return true;
};

const getCommentsByPost = async (postId) => {
    return await Comment.findAll({
        where: { postId },
        include: {
            model: User,
            attributes: ['id', 'username', 'email']
        },
        order: [['createdAt', 'DESC']]
    });
};

export default {
    createPost,
    getPostWithLikes, 
    toggleLike,
    getUsersWhoLikedPost,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByPost
};
