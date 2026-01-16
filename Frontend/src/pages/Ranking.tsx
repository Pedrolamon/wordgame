import { useState, useEffect } from 'react';
import { Trophy, Medal, User, ChevronLeft } from 'lucide-react';
import { api } from "../../libs/api";
import Name from '../components/ui/Name';
import { Link } from 'react-router-dom'; 

interface RankingUser {
  username: string;
  points: number;
}

export default function Ranking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await api.get('/ranking'); 
        setRanking(response.data);
      } catch (error) {
        console.error("Erro ao buscar ranking", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-(--color-primary) py-8 px-4">
      <div className='flex justify-center mb-8'>
        <Name size="text-5xl" />
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-(--secondary-color) rounded-3xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                Top 10 Players
              </h1>
            </div>
            
            {/* Link to return to the game*/}
            <Link to="/game" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </div>

          {/*List of Players */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-10 text-slate-400 animate-pulse">Loading ranking...</p>
            ) : (
              ranking.map((player, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    index === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white/50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/*Position/Icon*/}
                    <div className="w-8 flex justify-center">
                      {index === 0 ? <Medal className="w-6 h-6 text-amber-500" /> : 
                       index === 1 ? <Medal className="w-6 h-6 text-slate-400" /> :
                       index === 2 ? <Medal className="w-6 h-6 text-orange-400" /> :
                       <span className="font-bold text-slate-400">#{index + 1}</span>}
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700 truncate max-w-[120px]">
                        {player.username}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pts</span>
                    <span className={`text-lg font-black ${index === 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
                      {player.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Play Again Button (Footer) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
             <Link to="/game">
               <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/30 uppercase tracking-widest active:scale-95">
                  Play Now
               </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}