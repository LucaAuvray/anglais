import { NavLink, Route, Routes } from 'react-router';
import Article from './pages/Article.tsx';
import Aujourdhui from './pages/Aujourdhui.tsx';
import DejaLus from './pages/DejaLus.tsx';
import Memo from './pages/Memo.tsx';
import Mots from './pages/Mots.tsx';
import Reglages from './pages/Reglages.tsx';
import Video from './pages/Video.tsx';

const LIENS = [['/', "Aujourd'hui"], ['/lus', 'Déjà lus'], ['/mots', 'Mots'], ['/memo', 'Mémo'], ['/reglages', 'Réglages']] as const;

export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-12">
      <nav className="sticky top-0 z-10 -mx-4 mb-4 flex gap-1 overflow-x-auto border-b border-stone-200 bg-stone-50/95 px-4 py-2 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        {LIENS.map(([vers, nom]) => (
          <NavLink key={vers} to={vers} end
            className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800'}`}>
            {nom}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<Aujourdhui />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/video/:id" element={<Video />} />
        <Route path="/lus" element={<DejaLus />} />
        <Route path="/mots" element={<Mots />} />
        <Route path="/memo" element={<Memo />} />
        <Route path="/reglages" element={<Reglages />} />
        <Route path="*" element={<p>Page introuvable.</p>} />
      </Routes>
    </div>
  );
}
