import  { Router } from 'express';
import * as db from '../db';
import {generateWord, activeGames, normalizeWord, checkGuess, generateHint} from "../services/game-service"

const router = Router();

router.post('/start', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    try {
      const word = await generateWord();
      const gameId = `game_${Date.now()}_${userId}`;
      
      activeGames.set(gameId, {
        userId,
        word,
        attempts: [],
        hints: [],
        attemptCount: 0,
        won: false,
        finished: false
      });
      
      res.json({ gameId, wordLength: 5 });
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      res.status(500).json({ error: 'Erro ao iniciar jogo' });
    }
  });
  
  // Fazer tentativa
  router.post('/guess', async (req, res) => {
    const { gameId, guess } = req.body;
    
    if (!gameId || !guess) {
      return res.status(400).json({ error: 'gameId e guess são obrigatórios' });
    }
    
    const game = activeGames.get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    
    if (game.finished) {
      return res.status(400).json({ error: 'Jogo já finalizado' });
    }
    
    const normalizedGuess = normalizeWord(guess);
    if (normalizedGuess.length !== 5) {
      return res.status(400).json({ error: 'A palavra deve ter 5 letras' });
    }
    
    game.attemptCount++;
    const result = checkGuess(game.word, normalizedGuess);
    game.attempts.push(result);
    
    const won = normalizedGuess === normalizeWord(game.word);
    game.won = won;
    
    let hint: string | null | undefined = null;
    // Gerar dica a partir do segundo erro (após 2 tentativas)
    if (game.attemptCount >= 2 && !won && game.hints.length < 5) {
      hint = await generateHint(game.word, game.attemptCount, game.hints);
      game.hints.push(hint);
    }
    
    if (won || game.attemptCount >= 6) {
        game.finished = true;
        
        try {
          if (won) {
            const points = 100 - (game.attemptCount - 1) * 15;
            // Postgres usa $1, $2 para parâmetros
            await db.query('UPDATE users SET points = points + $1 WHERE id = $2', [points, game.userId]);
            await db.query(
              'INSERT INTO games (user_id, word, won, attempts) VALUES ($1, $2, $3, $4)',
              [game.userId, game.word, true, game.attemptCount]
            );
          } else {
            await db.query(
              'INSERT INTO games (user_id, word, won, attempts) VALUES ($1, $2, $3, $4)',
              [game.userId, game.word, false, game.attemptCount]
            );
          }
        } catch (dbError) {
          console.error('Erro ao salvar dados finais:', dbError);
        }
    
        activeGames.delete(gameId);
      }
    
    res.json({
      result,
      won,
      attemptCount: game.attemptCount,
      finished: game.finished,
      hint
    });
  });

  export default router