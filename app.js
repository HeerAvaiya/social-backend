import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());


//app.use(express.json());

app.use("/api/auth", express.json(), authRoutes);
app.use("/api/posts", express.json(), postRoutes);
app.use("/api/users", userRoutes);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.send("Welcome to backend Project");
});

connectDB(DATABASE_URL);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
