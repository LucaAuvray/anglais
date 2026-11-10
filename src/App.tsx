import { Route, Routes } from 'react-router';

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<main className="p-4">Anglais</main>} />
    </Routes>
  );
}
