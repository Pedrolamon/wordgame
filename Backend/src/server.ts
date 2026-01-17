import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db';

// Routes
import Ranking from "./routes/ranking";
import Game from "./routes/game";
import User from "./routes/user";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/ranking", Ranking);
app.use("/api/game", Game);
app.use("/api/user", User);

db.connectDB()
  .then(() => db.setupDatabase())
  .then(() => console.log("✅ Conectado ao PostgreSQL com sucesso!"))
  .catch(err => console.error("❌ Falha na conexão com o banco:", err));

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });

export default app;