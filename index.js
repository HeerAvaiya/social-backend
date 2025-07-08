// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB, { sequelize } from './config/db.js';
// import { User, Post, Comment, Like, Follower } from './models/index.js';
// import routes from "./routes/index.js";
// import "./models/associations.js";

// const app = express();

// app.use(express.json());
// app.use(cors());

// connectDB();

// app.use("/api/auth", routes.authRouter);
// app.use("/api/users", routes.userRouter);
// app.use("/api/posts", routes.postRouter);
// app.use('/api/likes', routes.likeRouter);
// app.use("/api/comments", routes.commentRouter);

// await sequelize.sync({ alter: true });
// console.log("🟢 All models were synchronized.");

// app.get("/", (req, res) => {
//     res.send("ASO tool server running successfully!");
// });

// app.listen(8001, () => {
//     console.log("server is running on port...");
// });





















import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/db.js';
import routes from './routes/index.js'; // updated index.js inside routes folder

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB connection
sequelize.sync().then(() => {
    console.log("✅ PostgreSQL connected via Sequelize");
}).catch(err => {
    console.error("❌ DB Connection Failed:", err.message);
});

// Mounting Routers
app.use('/api/auth', routes.authRouter);
app.use('/api/users', routes.userRouter);
app.use('/api/posts', routes.postRouter);

// If later you merge like/comment → post controller, remove old `likes/comments` usage
// Do not include these now:
// app.use('/api/likes', routes.likeRouter);
// app.use('/api/comments', routes.commentRouter);

app.get("/", (req, res) => {
    res.send("🚀 Social Media API running!");
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`🟢 Server is running on port ${PORT}`);
});
