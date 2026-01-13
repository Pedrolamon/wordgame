import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Armazenar jogos em memória (poderia ser Redis em produção)
const activeGames = new Map();

// Normalizar palavra (remover acentos, maiúsculas)
function normalizeWord(word) {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

// Verificar tentativa
function checkGuess(secretWord, guess) {
  const normalizedSecret = normalizeWord(secretWord);
  const normalizedGuess = normalizeWord(guess);
  
  const result = [];
  const secretLetters = normalizedSecret.split('');
  const guessLetters = normalizedGuess.split('');
  const secretCount = {};
  
  // Contar letras na palavra secreta
  for (const letter of secretLetters) {
    secretCount[letter] = (secretCount[letter] || 0) + 1;
  }
  
  // Primeira passada: marcar posições corretas
  const used = new Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === secretLetters[i]) {
      result[i] = { letter: guessLetters[i], status: 'correct' };
      used[i] = true;
      secretCount[guessLetters[i]]--;
    }
  }
  
  // Segunda passada: marcar letras na palavra mas em posição errada
  for (let i = 0; i < 5; i++) {
    if (!used[i]) {
      if (secretCount[guessLetters[i]] > 0) {
        result[i] = { letter: guessLetters[i], status: 'present' };
        secretCount[guessLetters[i]]--;
      } else {
        result[i] = { letter: guessLetters[i], status: 'absent' };
      }
    }
  }
  
  return result;
}

// Gerar palavra usando OpenAI
async function generateWord() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que gera palavras em português. Retorne APENAS uma palavra de 5 letras, sem acentos, em letras maiúsculas, sem explicações ou texto adicional.'
        },
        {
          role: 'user',
          content: 'Gere uma palavra em português com exatamente 5 letras, sem acentos.'
        }
      ],
      temperature: 0.8,
      max_tokens: 10
    });
    
    let word = response.choices[0].message.content.trim().toUpperCase();
    // Remover acentos e manter apenas letras
    word = normalizeWord(word).replace(/[^A-Z]/g, '');
    
    if (word.length !== 5) {
      // Fallback para palavras comuns
      const fallbackWords = ['TERMO', 'JOGAR', 'PALAV', 'LETRA', 'MUNDO'];
      word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
    
    return word;
  } catch (error) {
    console.error('Erro ao gerar palavra:', error);
    // Fallback
    const fallbackWords = ['TERMO', 'JOGAR', 'PALAV', 'LETRA', 'MUNDO'];
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  }
}

// Gerar dica usando OpenAI
async function generateHint(secretWord, attempts, previousHints = []) {
  try {
    const hintNumber = attempts - 1; // Primeira dica após 2 tentativas
    const hintText = previousHints.join('. ');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que dá dicas sobre uma palavra em português de 5 letras. A palavra é: ${secretWord}. Dê uma dica útil mas não muito óbvia. Seja criativo mas útil.`
        },
        {
          role: 'user',
          content: `Esta é a dica número ${hintNumber + 1} de 5. ${hintText ? `Dicas anteriores: ${hintText}` : ''} Dê uma dica sobre a palavra sem revelar diretamente.`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar dica:', error);
    return 'Continue tentando!';
  }
}

// Endpoints

// Criar ou obter usuário
app.post('/api/user', (req, res) => {
  const { username } = req.body;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
  }
  
  try {
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
    
    if (!user) {
      const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username.trim());
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar/obter usuário' });
  }
});

// Iniciar novo jogo
app.post('/api/game/start', async (req, res) => {
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
app.post('/api/game/guess', async (req, res) => {
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
  
  let hint = null;
  // Gerar dica a partir do segundo erro (após 2 tentativas)
  if (game.attemptCount >= 2 && !won && game.hints.length < 5) {
    hint = await generateHint(game.word, game.attemptCount, game.hints);
    game.hints.push(hint);
  }
  
  if (won || game.attemptCount >= 6) {
    game.finished = true;
    
    // Salvar no banco de dados
    if (won) {
      const points = 100 - (game.attemptCount - 1) * 15; // 100, 85, 70, 55, 40, 25
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(points, game.userId);
      db.prepare('INSERT INTO games (user_id, word, won, attempts) VALUES (?, ?, ?, ?)')
        .run(game.userId, game.word, 1, game.attemptCount);
    } else {
      db.prepare('INSERT INTO games (user_id, word, won, attempts) VALUES (?, ?, ?, ?)')
        .run(game.userId, game.word, 0, game.attemptCount);
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

// Obter ranking
app.get('/api/ranking', (req, res) => {
  try {
    const ranking = db.prepare(`
      SELECT username, points 
      FROM users 
      ORDER BY points DESC 
      LIMIT 10
    `).all();
    
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter ranking' });
  }
});

// Obter pontuação do usuário
app.get('/api/user/:userId/points', (req, res) => {
  try {
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ points: user.points });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pontuação' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
