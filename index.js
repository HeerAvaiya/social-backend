import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/db.js';
import routes from './routes/index.js';
import './models/associations.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,              
}));


app.use(cors());
app.use(express.json());

sequelize.sync().then(() => {
    console.log(" PostgreSQL connected via Sequelize");
}).catch(err => {
    console.error("DB Connection Failed:", err.message);
});

app.use('/api/auth', routes.authRouter);
app.use('/api/users', routes.userRouter);
app.use('/api/posts', routes.postRouter);

app.get("/", (req, res) => {
    res.send(" Social Media API running!");
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
