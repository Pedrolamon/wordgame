import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db';

//Routes
import Ranking from "./routes/ranking"
import Game from "./routes/game"
import User from "./routes/user"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

app.use("/ranking", Ranking);
app.use("/game", Game);
app.use("/user", User);

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

const connect = async () => {
  try {
    await db.connectDB();
    await db.setupDatabase();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

if (process.env.NODE_ENV !== 'production') {
  startServer();
} else {
  connect();
}


export default app;