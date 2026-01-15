import { Router } from 'express';
import * as db from '../db';

const router = Router();


router.post('/', async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
    }
  
    try {
      // Usando query assíncrona do seu arquivo db.js
      const userRes = await db.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
      let user = userRes.rows[0];
  
      if (!user) {
        const insertRes = await db.query(
          'INSERT INTO users (username) VALUES ($1) RETURNING *', 
          [username.trim()]
        );
        user = insertRes.rows[0];
      }
  
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar/obter usuário' });
    }
  });
  
  // Obter pontuação do usuário
  router.get('/:userId/points', async (req, res) => {
    try {
      // No Postgres usamos $1 e passamos o valor em um array []
      const result = await db.query('SELECT points FROM users WHERE id = $1', [req.params.userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json({ points: result.rows[0].points });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter pontuação' });
    }
  });

  export default router