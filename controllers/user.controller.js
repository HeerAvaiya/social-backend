import Handler from "../utils/handler.js";
import userService from "../services/user.service.js";
import followerService from "../services/follower.service.js";
import User from "../models/User.js";

// GET my profile
export const getUserMeController = Handler(async (req, res) => {
    const user_id = req.user.id;
    const user = await userService.findUser({ id: user_id });

    if (!user) throw new Error("User not found");

    res.status(200).json({
        error: false,
        data: user,
    });
});

// UPDATE my profile
export const updateUserMeController = Handler(async (req, res) => {
    const user_id = req.user.id;
    const updateData = req.body;

    const updatedUser = await userService.updateUser(user_id, updateData);

    res.status(200).json({
        error: false,
        message: "User updated successfully",
        data: updatedUser,
    });
});

// DELETE my account
export const deleteUserMeController = Handler(async (req, res) => {
    const user_id = req.user.id;

    await userService.deleteUser(user_id);

    res.status(200).json({
        error: false,
        message: "User deleted successfully"
    });
});

// FOLLOW - Send follow request
export const sendFollowRequestController = async (req, res) => {
    try {
        const followerId = req.user.id;
        const userId = req.params.userId;

        if (followerId === userId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const status = await followerService.sendFollowRequest(followerId, userId);

        if (status === 'accepted') {
            res.status(200).json({ success: true, message: "Followed successfully (public account)" });
        } else {
            res.status(200).json({ success: true, message: "Follow request sent (private account, pending approval)" });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ACCEPT follow request
export const acceptFollowRequestController = async (req, res) => {
    try {
        const userId = req.user.id;
        const followerId = req.params.followerId;

        await followerService.respondToRequest(followerId, userId, 'accept');
        res.status(200).json({ success: true, message: "Follow request accepted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// REJECT follow request
export const rejectFollowRequestController = async (req, res) => {
    try {
        const userId = req.user.id;
        const followerId = req.params.followerId;

        await followerService.respondToRequest(followerId, userId, 'reject');
        res.status(200).json({ success: true, message: "Follow request rejected" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// UNFOLLOW user
export const unfollowUserController = async (req, res) => {
    try {
        const followerId = req.user.id;
        const userId = req.params.userId;

        await followerService.unfollowUser(followerId, userId);
        res.status(200).json({ success: true, message: "Unfollowed successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// TOGGLE privacy
export const togglePrivacyController = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        user.isPrivate = !user.isPrivate;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Account is now ${user.isPrivate ? "Private" : "Public"}`,
            isPrivate: user.isPrivate
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET my followers
export const getFollowersController = async (req, res) => {
    try {
        const userId = req.params.userId;
        const followers = await followerService.getFollowers(userId);
        res.status(200).json({ success: true, followers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET my followings
export const getFollowingController = async (req, res) => {
    try {
        const userId = req.params.userId;
        const following = await followerService.getFollowing(userId);
        res.status(200).json({ success: true, following });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
