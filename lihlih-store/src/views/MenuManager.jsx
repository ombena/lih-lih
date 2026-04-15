import React, { useState } from 'react';
import { KineticSwitch } from '../components/InteractiveControls';

// Mock Data for Phase 3 Development
const MOCK_MENU = [
  { id: 1, name: "Tacos Poulet (Taille M)", category: "Tacos", isAvailable: true, price: 400 },
  { id: 2, name: "Tacos Viande Hachée (Taille L)", category: "Tacos", isAvailable: true, price: 550 },
  { id: 3, name: "Tacos Mixte (XL)", category: "Tacos", isAvailable: false, price: 700 },
  { id: 4, name: "Pizza Carrée", category: "Pizza", isAvailable: true, price: 150 },
  { id: 5, name: "Pizza Marguerita", category: "Pizza", isAvailable: true, price: 400 },
  { id: 6, name: "Canette Coca-Cola", category: "Boissons", isAvailable: true, price: 100 },
  { id: 7, name: "Eau Minérale 0.5L", category: "Boissons", isAvailable: true, price: 30 }
];

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState(MOCK_MENU);

  // Optimistic UI Toggle: Instantly changes the UI state, assuming the backend call will succeed.
  const handleToggle = (id) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    // TODO Phase 5: Make PATCH request to /api/items/:item_id/toggle-availability
  };

  // Group items by category to make it easier for the chef to find them
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans pb-24">
      <header className="mb-8 px-2">
        <h1 className="text-4xl font-black tracking-tighter text-[#ae2900]">Gestion des Stocks</h1>
        <p className="text-[#595c5d] font-bold tracking-widest uppercase mt-2 text-xs">
          Masquez instantanément les articles en rupture de stock
        </p>
      </header>

      <div className="max-w-3xl space-y-10">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="bg-[#eff1f2] rounded-[2.5rem] p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#2c2f30] tracking-tighter mb-6 px-2 uppercase">
              {category}
            </h2>
            
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="relative">
                  <KineticSwitch 
                    label={item.name} 
                    isToggled={item.isAvailable} 
                    onToggle={() => handleToggle(item.id)} 
                  />
                  {!item.isAvailable && (
                     <div className="absolute top-1/2 left-4 -translate-y-1/2 -translate-x-1 w-2 h-8 bg-red-500 rounded-full z-10 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}