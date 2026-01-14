import type { LetterStatus } from '../types';


interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Record<string, LetterStatus>;
}

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function Keyboard({ onKeyPress, letterStates }: KeyboardProps) {
  const getKeyColor = (key: string) => {
    const status = letterStates[key];
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'present':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'absent':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      default:
        return 'bg-gray-300 text-gray-900 hover:bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`px-3 py-4 font-bold rounded-md transition-colors ${
                getKeyColor(key)
              } ${
                key === 'ENTER' || key === 'BACKSPACE'
                  ? 'px-4 text-sm'
                  : 'min-w-10'
              }`}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
