// services/follower.service.js
import Follower from '../models/Followers.js';
import User from '../models/User.js';

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

export default {
    sendFollowRequest,
    respondToRequest,
    unfollowUser,
    getFollowers,
    getFollowing
};
