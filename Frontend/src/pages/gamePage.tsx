import { useState, useEffect, useCallback } from 'react';
import GameGrid from '../components/GameGrid';
import Keyboard from '../components/Keyboard';
import UserForm from '../components/UserForm';
import Hints from '../components/Hints';
import type { GameState, LetterStatus, LetterResult, User } from '../types';
import {api} from "../../libs/api"




function GamePage() {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    currentGuess: '',
    guesses: [],
    attemptCount: 0,
    won: false,
    finished: false,
    hints: [],
  });
  const [letterStates, setLetterStates] = useState<Record<string, LetterStatus>>({});
  const [points, setPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleUserSubmit = async (username: string) => {
    try {
      const response = await api.post(`/user`, { username });
      const data = response.data;
      setUser(data);
      setPoints(data.points);
      startNewGame(data.id);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const startNewGame = async (userId: number) => {
    try {
      const response = await api.post(`/game/start`, { userId });
      const data = response.data;
      setGameState({
        gameId: data.gameId,
        currentGuess: '',
        guesses: [],
        attemptCount: 0,
        won: false,
        finished: false,
        hints: [],
      });
      setLetterStates({});
      setShowResult(false);
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      alert('Erro ao iniciar jogo');
    }
  };

  const submitGuess = useCallback(async () => {
    if (gameState.currentGuess.length !== 5 || !gameState.gameId) return;

    try {
      const response = await api.post(`/game/guess`, {
          gameId: gameState.gameId,
          guess: gameState.currentGuess,
        });
      const data =  response.data;

      const newGuesses = [...gameState.guesses, data.result as LetterResult[]];
      const newAttemptCount = gameState.attemptCount + 1;

      // Atualizar estados das letras no teclado
      const newLetterStates = { ...letterStates };
      data.result.forEach((result: LetterResult) => {
        const currentStatus = newLetterStates[result.letter];
        // Só atualiza se for um status melhor
        if (
          !currentStatus ||
          (result.status === 'correct') ||
          (result.status === 'present' && currentStatus !== 'correct')
        ) {
          newLetterStates[result.letter] = result.status;
        }
      });

      const newHints = data.hint
        ? [...gameState.hints, data.hint]
        : gameState.hints;

      setGameState({
        ...gameState,
        currentGuess: '',
        guesses: newGuesses,
        attemptCount: newAttemptCount,
        won: data.won,
        finished: data.finished,
        hints: newHints,
      });
      setLetterStates(newLetterStates);

      if (data.finished) {
        setShowResult(true);
        if (data.won && user) {
          const pointsResponse = await api.get(`/user/${user.id}/points`);
          setPoints(pointsResponse.data.points);
        }
      }
    } catch (error) {
      console.error('Erro ao fazer tentativa:', error);
      alert('Erro ao fazer tentativa');
    }
  }, [gameState, letterStates, user]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState.finished) return;

      if (key === 'ENTER') {
        if (gameState.currentGuess.length === 5) {
          submitGuess();
        }
      } else if (key === 'BACKSPACE') {
        setGameState({
          ...gameState,
          currentGuess: gameState.currentGuess.slice(0, -1),
        });
      } else if (gameState.currentGuess.length < 5) {
        setGameState({
          ...gameState,
          currentGuess: gameState.currentGuess + key,
        });
      }
    },
    [gameState, submitGuess]
  );

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (gameState.finished) return;

      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else if (/^[A-Z]$/.test(key) && gameState.currentGuess.length < 5) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [gameState, handleKeyPress]);

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            TERMO
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Descubra a palavra certa em 6 tentativas
          </p>
          <UserForm onSubmit={handleUserSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">TERMO</h1>
          <div className="flex justify-center items-center gap-6 text-lg">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="font-bold text-gray-700">Jogador: </span>
              <span className="text-blue-600">{user.username}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="font-bold text-gray-700">Pontos: </span>
              <span className="text-green-600">{points}</span>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <GameGrid
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.attemptCount}
          />

          {/* Hints */}
          <Hints hints={gameState.hints} />

          {/* Result Message */}
          {showResult && (
            <div className="text-center mb-4">
              {gameState.won ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Parabéns! Você acertou!
                  </h2>
                  <p className="text-green-700">
                    Você conseguiu em {gameState.attemptCount} tentativa(s)
                  </p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
                  <h2 className="text-2xl font-bold text-red-800 mb-2">
                    Fim de jogo!
                  </h2>
                  <p className="text-red-700">Tente novamente!</p>
                </div>
              )}
              <button
                onClick={() => startNewGame(user.id)}
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Novo Jogo
              </button>
            </div>
          )}
        </div>

        {/* Keyboard */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
        </div>
      </div>
    </div>
  );
}

export default GamePage;
