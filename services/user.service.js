import User from "../models/User.js";
import Follower from "../models/Followers.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const findUser = async (whereQuery) => {
    const result = await User.findOne({ where: whereQuery });
    if (result?.password) delete result.dataValues.password;
    return result;
};

const updateUser = async (id, userBody) => {
    await User.update(userBody, { where: { id } });
    return await findUser({ id });
};

const getUserById = async (userId) => {
    return await User.findByPk(userId);
};

const updateUserProfileImage = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    user.profileImageUrl = data.profileImageUrl;
    user.cloudinaryPublicId = data.cloudinaryPublicId;

    await user.save();
    return user;
};

const sendFollowRequest = async (followerId, userId) => {
    if (Number(followerId) === Number(userId)) {
        throw new Error("You cannot follow yourself");
    }

    const existing = await Follower.findOne({ where: { followerId, userId } });
    if (existing) throw new Error("Already requested or following");

    const user = await User.findByPk(userId);
    const status = user.isPrivate ? 'pending' : 'accepted';

    await Follower.create({ followerId, userId, status });
    return status;
};

const respondToRequest = async (followerId, userId, action) => {
    const follow = await Follower.findOne({ where: { followerId, userId, status: 'pending' } });
    if (!follow) throw new Error("No pending request found");

    if (action === 'accept') {
        follow.status = 'accepted';
    } else if (action === 'reject') {
        follow.status = 'rejected';
    } else {
        throw new Error("Invalid action");
    }

    await follow.save();
    return follow.status;
};

const unfollowUser = async (followerId, userId) => {
    const follow = await Follower.findOne({ where: { followerId, userId, status: 'accepted' } });
    if (!follow) throw new Error("You are not following this user");

    await follow.destroy();
    return true;
};

const getFollowers = async (userId) => {
    const followers = await Follower.findAll({
        where: { userId, status: 'accepted' },
        include: [{ model: User, as: 'FollowerUser', attributes: ['id', 'username'] }],
    });
    return followers.map(f => f.FollowerUser);
};

const getFollowing = async (userId) => {
    const following = await Follower.findAll({
        where: { followerId: userId, status: 'accepted' },
        include: [{ model: User, as: 'FollowingUser', attributes: ['id', 'username'] }],
    });
    return following.map(f => f.FollowingUser);
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const token = jwt.sign({ id: user.id }, process.env.RESET_TOKEN_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const message = `<p>Click to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

    await sendEmail({ to: user.email, subject: "Reset Your Password", html: message });

    return true;
};

const resetPassword = async (token, newPassword) => {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error("User not found");

    const hashed = await bcrypt.hash(newPassword, Number(process.env.SALTROUNDS));
    user.password = hashed;
    await user.save();

    return true;
};


export default {
    findUser,
    updateUser,
    getUserById,
    updateUserProfileImage,
    sendFollowRequest,
    respondToRequest,
    unfollowUser,
    getFollowers,
    getFollowing,
    forgotPassword,
    resetPassword,
};
