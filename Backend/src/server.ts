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


app.use("/api/ranking", Ranking);
app.use("/api/game", Game);
app.use("/api/user", User);

const startServer = async () => {
  try {
      await db.connectDB();
      await db.setupDatabase();
      app.listen(PORT, () => {
        console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
      });
  } catch (error) {
      console.error('Falha ao iniciar o servidor:', error);
      process.exit(1);
  }
};

startServer();
