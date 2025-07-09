import Handler from "../utils/handler.js";
import userService from "../services/user.service.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { CLIENT_RENEG_LIMIT } from "tls";


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



export const createProfileImageController = async (req, res) => {
    let tempPublicId = null;

    try {
        const userId = req.user.id;
        const user = await userService.getUserById(userId);

        if (!user) return res.status(404).json({ error: "User not found" });
        if (!req.file) return res.status(400).json({ error: "Image file is required" });

        // Delete old image (if exists)
        if (user.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        }

        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "user_profiles",
        });

        tempPublicId = result.public_id;

        // Delete temp file
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Save to DB
        const updatedUser = await userService.updateUserProfileImage(userId, {
            profileImageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
        });

        res.status(200).json({
            message: "Profile image uploaded successfully",
            user: updatedUser,
        });

    } catch (error) {
        // Cleanup if DB fails
        if (tempPublicId) {
            try {
                await cloudinary.uploader.destroy(tempPublicId);
            } catch (e) {
                console.error("Rollback failed:", e.message);
            }
        }

        console.error("Profile image upload error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


export const updateProfileImageController = async (req, res) => {
    let tempPublicId = null;

    try {
        const userId = req.user.id;
        const user = await userService.getUserById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!req.file) return res.status(400).json({ error: "Image file is required" });

        // Delete old image from Cloudinary
        if (user.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "user_profiles"
        });

        tempPublicId = result.public_id;

        // Delete temp file
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Update user in DB
        const updatedUser = await userService.updateUserProfileImage(userId, {
            profileImageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id
        });

        res.status(200).json({
            message: "Profile image updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        if (tempPublicId) {
            try {
                await cloudinary.uploader.destroy(tempPublicId);
            } catch (e) {
                console.error("Rollback failed:", e.message);
            }
        }

        console.error("Profile image update error:", error.message);
        res.status(500).json({ error: error.message });
    }
};



export const deleteProfileImageController = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userService.getUserById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // If no image to delete
        if (!user.cloudinaryPublicId) {
            return res.status(400).json({ error: "No profile image to delete" });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(user.cloudinaryPublicId);

        // Update user in DB
        const updatedUser = await userService.updateUserProfileImage(userId, {
            profileImageUrl: null,
            cloudinaryPublicId: null,
        });

        res.status(200).json({
            message: "Profile image deleted successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Profile image delete error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


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


// FORGOT PASSWORD
export const forgotPasswordController = Handler(async (req, res) => {
    const { email } = req.body;
    await userService.forgotPassword(email);

    res.status(200).json({ error: false, message: "Reset link sent to email" });
});


export const resetPasswordController = Handler(async (req, res) => {
    const token = req.params.token;
    const { newPassword } = req.body;
    console.log(newPassword);
    if (!newPassword || newPassword.trim().length < 6) {
        return res.status(400).json({ error: true, message: "New password is required and must be at least 6 characters." });
    }

    await userService.resetPassword(token, newPassword);

    res.status(200).json({ error: false, message: "Password reset successfully" });
});
