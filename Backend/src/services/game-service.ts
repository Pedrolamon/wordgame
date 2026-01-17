import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Map which players are associated with which words.
  export const activeGames = new Map();
  

// Normalize word (remove accents, capitalization)
 export function normalizeWord(word: string): string {
    return word
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }
  
  interface GuessResult {
    letter: string;
    status: 'correct' | 'present' | 'absent';
  }

// Verify attempt
export function checkGuess(secretWord: string, guess:string): GuessResult[] {
    const normalizedSecret = normalizeWord(secretWord);
    const normalizedGuess = normalizeWord(guess);
    
    const result: GuessResult[] = [];
    const secretLetters = normalizedSecret.split('');
    const guessLetters = normalizedGuess.split('');
    const secretCount: Record<string, number> = {};
    
    // Counting letters in the secret word
    for (const letter of secretLetters) {
      secretCount[letter] = (secretCount[letter] || 0) + 1;
    }
    
    // First pass: mark the correct positions.
    const used = new Array(5).fill(false);
    for (let i = 0; i < 5; i++) {
      const char = guessLetters[i];
      if (char && char === secretLetters[i]) {
        result[i] = { letter: char, status: 'correct' };
        used[i] = true;
       if (secretCount[char] !== undefined) {
      secretCount[char]--;
    }
    }
    }
    
    // Step 2: Mark letters in the word but in the wrong position.
    for (let i = 0; i < 5; i++) {
      const char = guessLetters[i];
      if (!used[i] && char) {
        // Verificamos se existe e se é maior que 0
        const count = secretCount[char] || 0;
        if (count > 0) {
          result[i] = { letter: char, status: 'present' };
          secretCount[char] = count - 1;
        } else {
          result[i] = { letter: char, status: 'absent' };
        }
      }
    }
    
    return result;
  }
  
  // generating words using OpenAI
  export async function generateWord() {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that generates words in English. Return ONLY one 5-letter word, without accents, in capital letters, without explanations or additional text.'
          },
          {
            role: 'user',
            content: 'Generate a word in English with exactly 5 letters, without accents..'
          }
        ],
        temperature: 0.8,
        max_tokens: 10
      });
      
      let word = response.choices[0]?.message?.content?.trim().toUpperCase() || "";
      // Remove accents and keep only letters.
      word = normalizeWord(word).replace(/[^A-Z]/g, '');
      
      if (word?.length !== 5) {
        const fallbackWords = ['APPLE', 'HOUSE', 'GREEN', 'LIGHT', 'WATER'];
        word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)] || 'APPLE';
      }
      
      return word;
    } catch (error) {
      console.error('Error generating word:', error);
      // Fallback, words reserved for even if there is no word the game keeps running
      const fallbackWords = ['APPLE', 'HOUSE', 'GREEN', 'LIGHT', 'WATER'];
      return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
  }
  
  // generating words using OpenAI
  export async function generateHint(secretWord: string, attempts:number, previousHints: string[] = []): Promise<string> {
    try {
      const hintNumber = attempts - 1; 
      const hintText = previousHints.join('. ');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an assistant giving clues about a 5-letter word in Portuguese.. The word is: ${secretWord}. Give a useful but not too obvious tip. Be creative but helpful.`
          },
          {
            role: 'user',
            content: `This is tip number ${hintNumber + 1} out of 5. ${hintText ? `Previous tips: ${hintText}` : ''} Give a hint about the word without revealing it directly.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });
      
      return response.choices[0]?.message?.content?.trim() || 'Keep trying!';
    } catch (error) {
      console.error('Error generating tip:', error);
      return 'Keep trying!';
    }
  }