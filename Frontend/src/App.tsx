import { Routes, Route } from "react-router-dom";
//pages
import GamePage from "./pages/gamePage";



const routes = [
  {
    path: "/game",
    element: <GamePage />,
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
