export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface GameState {
  gameId: string | null;
  currentGuess: string;
  guesses: LetterResult[][];
  attemptCount: number;
  won: boolean;
  finished: boolean;
  hints: string[];
}

export interface User {
  id: number;
  username: string;
  points: number;
}
