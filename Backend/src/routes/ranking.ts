import { Router } from 'express';
import * as db from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await db.query(`
        SELECT username, points 
        FROM users 
        ORDER BY points DESC 
        LIMIT 10
      `);

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter ranking' });
  }
});

export default router