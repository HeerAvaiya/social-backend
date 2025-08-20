import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Follower from "../models/Followers.js";
import { Op } from "sequelize";

const createPost = async ({ createdBy, caption, imageUrl, cloudinaryPublicId }) => {
    console.log("Creating post with:", { createdBy, caption, imageUrl, cloudinaryPublicId });

    const user = await User.findByPk(createdBy);
    if (!user) {
        throw new Error("User does not exist");
    }

    return await Post.create({
        createdBy,
        caption,
        imageUrl,
        cloudinaryPublicId,
    });
};

const getPostById = async (postId) => {
    return await Post.findByPk(postId);
};


const updatePostImage = async (postId, { imageUrl, cloudinaryPublicId, caption }) => {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (cloudinaryPublicId !== undefined) post.cloudinaryPublicId = cloudinaryPublicId;
    if (caption !== undefined) post.caption = caption;

    await post.save();
    return post;
};  


const getAllPosts = async () => {
    return await Post.findAll({
        include: {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'profileImageUrl']
        },
        order: [['createdAt', 'DESC']]
    });
};

const getPostsByUserId = async (userId) => {
    return await Post.findAll({
        where: { createdBy: userId },
        include: {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'profileImageUrl']
        },
        order: [["createdAt", "DESC"]],
    });
};


const deletePost = async (postId) => {
    return await Post.destroy({ where: { id: postId } });
};


const getPostWithLikes = async (postId) => {
    return await Post.findByPk(postId, {
        include: [
            {
                model: Like,
                as: "Likes",
                include: [
                    {
                        model: User,
                        as: "User",
                        attributes: ["id", "username", "email"],
                    },
                ],
            },
        ],
    });
};


const toggleLike = async (userId, postId) => {
    const existingLike = await Like.findOne({ where: { userId, postId } });
    const post = await Post.findByPk(postId);

    if (!post) throw new Error("Post not found");

    if (existingLike) {
        await existingLike.destroy();
        post.likesCount = Math.max((post.likesCount || 0) - 1, 0);
        await post.save();
        return { liked: false, post, likedByMe: false };
    } else {
        await Like.create({ userId, postId });
        post.likesCount = (post.likesCount || 0) + 1;
        await post.save();
        return { liked: true, post, likedByMe: true };
    }
};



const getUsersWhoLikedPost = async (postId) => {
    const likes = await Like.findAll({
        where: { postId },
        include: [{
            model: User,
            attributes: ['id', 'username', 'email', 'profileImageUrl']
        }]
    });
    return likes.map(like => like.User);
};

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
            attributes: ['id', 'username', 'email', 'profileImageUrl']
        },
        order: [['createdAt', 'DESC']]
    });
};


const getFeedPosts = async (userId) => {
    const following = await Follower.findAll({
        where: { followerId: userId, status: "accepted" },
        attributes: ["userId"],
    });

    const followingIds = following.map(f => f.userId);

    followingIds.push(userId);

    const posts = await Post.findAll({
        where: { createdBy: followingIds },
        include: [
            { model: User, as: "creator", attributes: ["id", "username", "profileImageUrl"] }
        ],
        order: [["createdAt", "DESC"]],
    });

    return posts;
};

export default {
    createPost,
    getPostById,
    updatePostImage,
    getAllPosts,
    getPostsByUserId,
    deletePost,
    getPostWithLikes,
    toggleLike,
    getUsersWhoLikedPost,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByPost,
    getFeedPosts
};

