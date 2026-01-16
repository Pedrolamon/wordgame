import { Routes, Route } from "react-router-dom";
//pages
import GamePage from "./pages/Game";
import Ranking from "./pages/ranking"



const routes = [
  {
    path: "/game",
    element: <GamePage />,
  },
  {
    path: "/rank",
    element: <Ranking />,
  },
] as const;



export default function AppRoutes() {
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={element}
        />
      ))}
    </Routes>
  );
}
