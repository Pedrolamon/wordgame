import { Link } from "react-router-dom";

interface LogoProps {
  size?: string;
}

export default function Logo({ size = "text-2xl" }: LogoProps) {
  return (
    <Link to="/" className="hover:opacity-80 transition-opacity">
      <div className="flex items-center">
        <span className={`font-black ${size} tracking-tighter uppercase italic`}>
          <span className="text-emerald-500">W</span>
          <span className="text-amber-400">O</span>
          <span className="text-slate-400">R</span>
          <span className="text-emerald-500">D</span>
        </span>

        <span className={`font-black ${size} tracking-tighter uppercase italic text-(--button-color)`}>
          Game
        </span>
      </div>
    </Link>
  );
}