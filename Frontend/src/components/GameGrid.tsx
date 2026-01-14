import type { LetterStatus } from '../types';

interface GameGridProps {
  guesses: Array<Array<{ letter: string; status: LetterStatus }>>;
  currentGuess: string;
  currentRow: number;
}

export default function GameGrid({ guesses, currentGuess, currentRow }: GameGridProps) {
  const rows = 6;
  const cols = 5;

  const getCellContent = (row: number, col: number) => {
    if (row < guesses.length) {
      return guesses[row][col]?.letter || '';
    }
    if (row === guesses.length && col < currentGuess.length) {
      return currentGuess[col];
    }
    return '';
  };

  const getCellStatus = (row: number, col: number): LetterStatus => {
    if (row < guesses.length) {
      return guesses[row][col]?.status || 'empty';
    }
    return 'empty';
  };

  const getStatusColor = (status: LetterStatus) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'present':
        return 'bg-yellow-500 text-white';
      case 'absent':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 border-2 border-gray-300 text-gray-900';
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-8">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-2 justify-center">
          {Array.from({ length: cols }).map((_, col) => {
            const content = getCellContent(row, col);
            const status = getCellStatus(row, col);
            const isCurrentRow = row === guesses.length;
            
            return (
              <div
                key={col}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-md transition-all duration-300 ${
                  getStatusColor(status)
                } ${
                  isCurrentRow && content
                    ? 'border-2 border-blue-500 animate-pulse'
                    : ''
                }`}
              >
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
