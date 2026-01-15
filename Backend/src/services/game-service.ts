import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Armazenar jogos em memória (poderia ser Redis em produção)
  export  const activeGames = new Map();
  
  
// Normalizar palavra (remover acentos, maiúsculas)
 export function normalizeWord(word) {
    return word
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

// Verificar tentativa
export function checkGuess(secretWord, guess) {
    const normalizedSecret = normalizeWord(secretWord);
    const normalizedGuess = normalizeWord(guess);
    
    const result: { letter: string; status: string }[] = [];
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
  export async function generateWord() {
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
      
      let word = response.choices[0].message.content?.trim().toUpperCase() || "";
      // Remover acentos e manter apenas letras
      word = normalizeWord(word).replace(/[^A-Z]/g, '');
      
      if (word?.length !== 5) {
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
  export async function generateHint(secretWord, attempts, previousHints = []) {
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
      
      return response.choices[0].message.content?.trim();
    } catch (error) {
      console.error('Erro ao gerar dica:', error);
      return 'Continue tentando!';
    }
  }