// import Like from '../models/Like.js';
// import Post from '../models/Post.js';

// const toggleLike = async (userId, postId) => {
//     const existingLike = await Like.findOne({ where: { userId, postId } });

//     const post = await Post.findByPk(postId);
//     if (!post) throw new Error("Post not found");

//     if (existingLike) {
//         // Unlike the post
//         await existingLike.destroy();

//         // Decrease like count safely
//         post.likesCount = Math.max((post.likesCount || 0) - 1, 0);
//         await post.save();

//         console.log("❌ Decremented likesCount:", post.likesCount);
//         return { liked: false };
//     } else {
//         // Like the post
//         await Like.create({ userId, postId });

//         // Increase like count
//         post.likesCount = (post.likesCount || 0) + 1;
//         await post.save();

//         console.log("✅ Incremented likesCount:", post.likesCount);
//         return { liked: true };
//     }
// };

// export default { toggleLike };






import Like from '../models/Like.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

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

export default {
    toggleLike,
    getUsersWhoLikedPost,
};
