import { Router } from 'express';
import * as db from '../db.js';
import { generateWord, activeGames, normalizeWord, checkGuess, generateHint } from "../services/game-service.js"

const router = Router();

router.post('/start', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
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

    return res.json({ gameId, wordLength: 5 });
  } catch (error) {
    console.error('Error starting game:', error);
    return res.status(500).json({ error: 'Error starting game' });
  }
});

// Try it
router.post('/guess', async (req, res) => {
  const { gameId, guess } = req.body;

  if (!gameId || !guess) {
    return res.status(400).json({ error: 'Game ID and guess are required' });
  }

  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (game.finished) {
    return res.status(400).json({ error: 'Game already finished' });
  }

  const normalizedGuess = normalizeWord(guess);
  if (normalizedGuess.length !== 5) {
    return res.status(400).json({ error: 'The word must have 5 letters.' });
  }

  game.attemptCount++;
  const result = checkGuess(game.word, normalizedGuess);
  game.attempts.push(result);

  const won = normalizedGuess === normalizeWord(game.word);
  game.won = won;

  let hint: string | null | undefined = null;
  // Generate a hint based on the second error (after 2 attempts)
  if (game.attemptCount >= 2 && !won && game.hints.length < 5) {
    hint = await generateHint(game.word, game.attemptCount, game.hints);
    game.hints.push(hint);
  }

  if (won || game.attemptCount >= 6) {
    game.finished = true;

    try {
      if (won) {
        const points = 100 - (game.attemptCount - 1) * 15;
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
      console.error('Error saving final data:', dbError);
    }

    activeGames.delete(gameId);
  }

  return res.json({
    result,
    won,
    attemptCount: game.attemptCount,
    finished: game.finished,
    hint
  });
});

export default router