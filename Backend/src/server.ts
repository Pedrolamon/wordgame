import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db.js';

//Routes
import Ranking from "./routes/ranking.js"
import Game from "./routes/game.js"
import User from "./routes/user.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

app.use("/api/ranking", Ranking);
app.use("/api/game", Game);
app.use("/api/user", User);

const startServer = async () => {
  try {
    await db.connectDB();
    await db.setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};


startServer();

export default app;