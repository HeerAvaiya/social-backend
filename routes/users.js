import express from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadProfilePic from "../middleware/uploadProfilePic.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        const postCount = await Post.countDocuments({ createdBy: user._id });
        res.status(200).json({
            user,
            postCount
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
});

router.put("/me", authMiddleware, async (req, res) => {
    const { username, bio, description, password } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (description) user.description = description;
        if (password) user.password = await bcrypt.hash(password, 12);

        await user.save();
        res.status(200).json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

router.put("/:id/follow", authMiddleware, async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    try {
        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = targetUser.followers.includes(currentUserId);

        if (isFollowing) {
            targetUser.followers.pull(currentUserId);
            currentUser.following.pull(targetUserId);
            await targetUser.save();
            await currentUser.save();
            return res.status(200).json({ message: "Unfollowed the user" });
        } else {
            targetUser.followers.push(currentUserId);
            currentUser.following.push(targetUserId);
            await targetUser.save();
            await currentUser.save();
            return res.status(200).json({ message: "Followed the user" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Follow/unfollow failed", error: err.message });
    }
});


router.put("/me/profile-pic", authMiddleware, uploadProfilePic, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.profilePic && fs.existsSync(user.profilePic)) {
            fs.unlinkSync(user.profilePic);
        }

        user.profilePic = req.file.path;
        await user.save();

        res.status(200).json({ message: "Profile picture updated", profilePic: user.profilePic });
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
});

router.delete("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        await Post.deleteMany({ createdBy: userId });

        await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
        await Post.updateMany({}, { $pull: { comments: { user: userId } } });

        await User.updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );

        await User.updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );

        const user = await User.findById(userId);
        if (user?.profilePic && fs.existsSync(user.profilePic)) {
            fs.unlinkSync(user.profilePic);
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User and data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Deletion failed", error: err.message });
    }
});


router.post("/logout", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Logged out successfully. Please remove token from client side." });
});

export default router;
