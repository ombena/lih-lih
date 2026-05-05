import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, Outlet } from 'react-router-dom';
import KanbanBoard from './views/KanbanBoard';
import MenuManager from './views/MenuManager';
import StoreSettings from './views/StoreSettings';
import KitchenAlarm from './components/KitchenAlarm';
import { storeAPI } from './services/api';

const StoreLayout = () => {
  const { storeId } = useParams();
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Auto-Open Logic: When a store manager opens their dashboard, 
  // automatically mark the store as "Open" in the database.
  useEffect(() => {
    const openStore = async () => {
      try {
        await storeAPI.toggleStoreStatus(storeId, true);
        console.log(`Store ${storeId} automatically opened.`);
      } catch (err) {
        console.warn(`Could not auto-open store ${storeId}:`, err.response?.data?.message || err.message);
      }
    };
    if (storeId) openStore();
  }, [storeId]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f7]">
      <StoreNavigation />
      <KitchenAlarm storeId={parseInt(storeId)} /> 
      <div className="flex-1">
        <Outlet context={{ audioUnlocked, setAudioUnlocked }} />
      </div>
    </div>
  );
};

/**
 * StoreNavigation: Composant de navigation principale du tableau de bord.
 * Gère les liens vers les différentes sections de l'application.
 */
const StoreNavigation = () => {
  const { storeId } = useParams();
  
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
      <NavLink to={`/${storeId}/kanban`} className={navClass}>Cuisine</NavLink>
      <NavLink to={`/${storeId}/menu`} className={navClass}>Stock</NavLink>
      <NavLink to={`/${storeId}/settings`} className={navClass}>Paramètres</NavLink>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/1/kanban" replace />} />
        
        <Route path="/:storeId" element={<StoreLayout />}>
          <Route index element={<Navigate to="kanban" replace />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}