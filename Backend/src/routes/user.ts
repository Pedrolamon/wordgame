import { Router } from 'express';
import * as db from '../db.js';

const router = Router();

console.log("🔥 Backend iniciado na Vercel!");

router.post('/', async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    try {
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
      res.status(500).json({ error: 'Error creating/getting user' });
    }
  });
  
  // Get user score
  router.get('/:userId/points', async (req, res) => {
    try {
      const result = await db.query('SELECT points FROM users WHERE id = $1', [req.params.userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ points: result.rows[0].points });
    } catch (error) {
      res.status(500).json({ error: 'Error obtaining score' });
    }
  });

  export default router