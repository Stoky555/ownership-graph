import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewCalculationPage from "./pages/NewCalculationPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewCalculationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
