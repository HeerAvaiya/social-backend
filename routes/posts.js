import express from "express";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("imageUrl"), async (req, res) => {
    try {
        const newPost = new Post({
            caption: req.body.caption,
            imageUrl: req.file.path,
            createdBy: req.user._id
        });

        await newPost.save();
        res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        res.status(500).json({ message: "Error creating post", error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("createdBy", "username email")
            .populate("likes", "username email")
            .populate("comments.user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
});

router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user._id;
        const liked = post.likes.includes(userId);

        if (liked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({
            message: liked ? "Unliked" : "Liked",
            likes: post.likes.length
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to like/unlike post", error: err.message });
    }
});

router.post("/:id/comment", authMiddleware, async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json({ message: "Comment added", comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: "Failed to comment", error: err.message });
    }
});

router.get("/mine", authMiddleware, async (req, res) => {
    try {
        const myPosts = await Post.find({ createdBy: req.user._id })
            .populate("createdBy", "username email")
            .populate("likes", "username email")
            .populate("comments.user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(myPosts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your posts", error: err.message });
    }
});


export default router;
