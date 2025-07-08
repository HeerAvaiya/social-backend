import Post from "../models/Post.js";
import Like from "../models/Like.js";
import User from "../models/User.js";

const createPost = async ({ createdBy, image, caption }) => {
    return await Post.create({ createdBy, image, caption });
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

export default {
    createPost,
    getPostWithLikes
};
