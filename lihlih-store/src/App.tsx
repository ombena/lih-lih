import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import KanbanBoard from './views/KanbanBoard';
import MenuManager from './views/MenuManager';
import StoreSettings from './views/StoreSettings'; // Nouvelle vue importée

/**
 * StoreNavigation: Composant de navigation principale du tableau de bord.
 * Gère les liens vers les différentes sections de l'application.
 */
const StoreNavigation = () => {
  const navClass = ({ isActive }) => 
    `px-6 py-3 rounded-xl font-black tracking-widest uppercase text-sm transition-all whitespace-nowrap ${
      isActive 
        ? 'bg-[#ae2900] text-white shadow-lg shadow-orange-500/20' 
        : 'bg-white text-[#595c5d] hover:bg-[#eff1f2]'
    }`;

  return (
    <nav className="bg-white p-4 flex gap-4 shadow-sm sticky top-0 z-50 overflow-x-auto scrollbar-hide">
      <div className="flex items-center mr-4">
        <span className="text-xl font-black tracking-tighter text-[#2c2f30] bg-[#eff1f2] px-3 py-1 rounded-lg">
          LihLih <span className="text-[#ae2900]">Store</span>
        </span>
      </div>
      <NavLink to="/kanban" className={navClass}>Cuisine</NavLink>
      <NavLink to="/menu" className={navClass}>Stock</NavLink>
      <NavLink to="/settings" className={navClass}>Paramètres</NavLink>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#f5f6f7]">
        {/* Barre de navigation supérieure */}
        <StoreNavigation />

        {/* Contenu des pages */}
        <div className="flex-1">
          <Routes>
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/menu" element={<MenuManager />} />
            <Route path="/settings" element={<StoreSettings />} />
            {/* Redirection par défaut vers le tableau de cuisine */}
            <Route path="*" element={<Navigate to="/kanban" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}