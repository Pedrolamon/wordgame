import { useState, useEffect, useCallback } from 'react';
import GameGrid from '../components/GameGrid';
import Keyboard from '../components/Keyboard';
import UserForm from '../components/UserForm';
import Hints from '../components/Hints';
import type { GameState, LetterStatus, LetterResult, User, } from '../types';
import { api } from "../../libs/api"

import { Link } from 'react-router-dom';

import { UserRound, Trophy, ChartNoAxesColumn } from "lucide-react";

import Name from '../components/ui/Name';

function GamePage() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('wordgame_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserSubmit = async (username: string) => {
    try {
      const response = await api.post(`/user`, { username });
      const data = response.data;
      localStorage.setItem('wordgame_user', JSON.stringify(data));
      setUser(data);
      setPoints(data.points);
      startNewGame(data.id);
    } catch (error) {
      alert('Error creating user.');
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
      alert('Error starting game.');
    }
  };

  const submitGuess = useCallback(async () => {

    if (gameState.currentGuess.length !== 5 || !gameState.gameId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/game/guess`, {
        gameId: gameState.gameId,
        guess: gameState.currentGuess,
      });

      const data = response.data;

      const newGuesses = [...gameState.guesses, data.result as LetterResult[]];
      const newAttemptCount = gameState.attemptCount + 1;

      // Update letter states on the keyboard.
      const newLetterStates = { ...letterStates };
      data.result.forEach((result: LetterResult) => {
        const currentStatus = newLetterStates[result.letter];
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
      alert('Error while attempting');
    } finally {
      setIsSubmitting(false);
    }
  }, [gameState, letterStates, user, isSubmitting]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState.finished || isSubmitting) return;

      if (key === 'ENTER') {
        if (gameState.currentGuess.length < 5) {
          alert("The word must have 5 letters!");
          return;
        }
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
      <div className="min-h-screen bg-(--color-primary) flex items-center justify-center p-4">
        <div className="bg-(--secondary-color) rounded-2xl shadow-xl w-full max-w-md overflow-y-auto ">
          <UserForm onSubmit={handleUserSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-primary) py-4 px-2 md:py-8 md:px-4 overflow-x-hidden">
      <div className='flex justify-center mb-5'>
        <Name size="text-4xl" />
      </div>
      {/*Responsive Main Container*/}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-start gap-6">

        <div className="md:absolute md:top-28 md:left-6 w-full md:w-64 lg:w-80 px-2 order-2 md:order-0 mt-6 md:mt-0">
          <div className="md:sticky md:top-10">
            <Hints hints={gameState.hints} />
          </div>
        </div>

        <div className="w-full md:max-w-fit mx-auto order-1 md:order-2">
          <div className="bg-(--secondary-color) rounded-2xl shadow-xl p-4 md:p-6 mb-6">

            <div className="flex justify-between items-center mb-6 gap-2">
              <div className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-3 rounded-xl">

                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                  <span className="font-semibold text-slate-900">
                    {user.username}
                  </span>
                </div>

                <div className="w-px h-6 bg-slate-200" />

                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-slate-500">Points</span>
                  <span className="font-semibold text-emerald-500">
                    {points}
                  </span>
                </div>

              </div>
              <Link
                to="/rank"
                className="flex items-center gap-2 hover:bg-slate-100 p-2 rounded-lg transition-colors group"
                title="View Ranking"
              >
                <ChartNoAxesColumn className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-600">Rank</span>
              </Link>
            </div>
            <GameGrid
              guesses={gameState.guesses}
              currentGuess={gameState.currentGuess}
              currentRow={gameState.attemptCount}
            />
            {/* Result Message */}
            {showResult && (
              <div className="text-center mb-4">
                {gameState.won ? (
                  <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                      Congratulations! You got it right!
                    </h2>
                    <p className="text-green-700">
                      You succeeded in {gameState.attemptCount} attempt(s)
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
                    <h2 className="text-2xl font-bold text-red-800 mb-2">
                      Game over!
                    </h2>
                    <p className="text-red-700">Try again!</p>
                  </div>
                )}
                <button
                  onClick={() => startNewGame(user.id)}
                  className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  New Game
                </button>
              </div>
            )}
            <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} disabled={isSubmitting} />

          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
