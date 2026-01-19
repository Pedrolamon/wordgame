import {
  Gamepad2,
  Palette,
  Lightbulb,
  User,
  Play
} from "lucide-react";

import Name from "./ui/Name"
import { useState } from "react";


interface UserFormProps {
  onSubmit: (username: string) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    if (isLoading) return
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    try {
      await onSubmit(username.trim());
    } catch (error) {
      console.error("Erro ao processar login:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--secondary-color) rounded-3xl  transition-all">

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <Name />
        <section className="flex flex-col gap-3 text-sm leading-relaxed border-t border-slate-200 pt-1">

          <div className="flex gap-2 items-center">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold mb-1 text-slate-900 tracking-tight">
              How to Play
            </h1>
          </div>
          <p className="text-slate-600 ">
            Guess the secret word in a maximum of <b>6 attempts</b>. Each attempt must be a valid 5-letter word.
          </p>

          <div>
            <div className="flex gap-2 items-center">
              <Palette className="w-4 h-4 mb-2 text-green-500" />
              <h2 className="font-bold mb-2 text-slate-800 flex items-center gap-2">
                What do the colors mean?
              </h2>
            </div>
            <p className="mb-4 text-slate-600 font-medium">After each attempt, the letters change color to show how close you are:</p>

            <ul className="space-y-3">
              <li className="flex items-center gap-4 group">
                <span className="w-16 p-1.5 rounded-md text-white text-[11px] uppercase tracking-wider font-black bg-emerald-500 shadow-sm shadow-emerald-200 text-center">
                  Green
                </span>
                <span className="text-slate-600  border-l border-slate-200  pl-4">
                  Is in the correct position.
                </span>
              </li>

              <li className="flex items-center gap-4 group">
                <span className="w-16 p-1.5 rounded-md text-white text-[11px] uppercase tracking-wider font-black bg-amber-400 shadow-sm shadow-amber-100 text-center">
                  Yellow
                </span>
                <span className="text-slate-600 border-l border-slate-200 pl-4">
                  Part of the word, but it's in the wrong position
                </span>
              </li>

              <li className="flex items-center gap-4 group">
                <span className="w-16 p-1.5 rounded-md text-white text-[11px] uppercase tracking-wider font-black bg-slate-400 shadow-sm shadow-slate-200 text-center">
                  Gray
                </span>
                <span className="text-slate-600 border-slate-200  pl-4">
                  Letter not in the word
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-(--secondary-color) p-5 rounded-2xl border border-dashed border-slate-600 ">
            <div className="flex gap-2 items-center">
              <Lightbulb className="w-5 h-5 mb-3 text-amber-400" />
              <h2 className="font-bold mb-3 text-slate-800 ">Tips and Scoring</h2>
            </div>
            <p className="text-slate-600  mb-2"><b>Tips: </b>If you're having trouble, the game will generate an automatic hint after your second wrong attempt.</p>
            <p className="text-slate-600  mb-3"><b>Points:</b> The faster you get it right, the more points you earn for the global ranking!</p>
            <ul className="list-disc ml-5 space-y-2 text-slate-500 italic">
              <li>First attempt: 100 points</li>
              <li>Each mistake reduces the final score by 15 points.</li>
            </ul>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input
              type="text"
              name="username"
              maxLength={20}
              placeholder="Enter your name"
              className=" w-full pl-10 pr-4 py-3 text-base rounded-lg border border-slate-300
                      bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-(--button-color) text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors whitespace-nowrap {isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Play className="w-5 h-5" />
            {isLoading ? "Loading..." : "Start"}
          </button>
        </div>

      </form>
    </div>
  );
}