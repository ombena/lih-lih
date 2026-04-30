import React, { useState, useEffect } from 'react';
import { KineticSwitch } from '../components/InteractiveControls';
import { KineticButton, StockBadge } from '../components/UIPrimitives';
import ItemEditorModal from '../components/ItemEditorModal';
import { storeAPI } from '../services/api';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const STORE_ID = 1; // Hardcoded for MVP

  useEffect(() => {
    fetchMenu();
  }, []);

  const syncTags = async (items) => {
    // Extract unique categories, clean them, and filter out 'Général' if it's the only one
    const categories = Array.from(new Set(items.map(item => item.category)))
      .filter(cat => cat && cat !== 'Général')
      .slice(0, 5); // Limit to top 5 categories to keep the feed clean
    
    const tagsString = categories.join(', ');
    
    try {
      await storeAPI.updateStoreProfile(STORE_ID, { tags: tagsString });
      console.log("Discovery tags synced:", tagsString);
    } catch (error) {
      console.error("Failed to sync discovery tags", error);
    }
  };

  const fetchMenu = async (shouldSyncTags = false) => {
    setIsLoading(true);
    try {
      const items = await storeAPI.getStoreMenu(STORE_ID);
      setMenuItems(items);
      if (shouldSyncTags) {
        await syncTags(items);
      }
    } catch (error) {
      console.error("Failed to load menu", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id) => {
    // Optimistic UI Toggle
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, is_available: !item.is_available } : item
      )
    );
    
    try {
      await storeAPI.toggleItemAvailability(id);
    } catch (error) {
      // Revert if error
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, is_available: !item.is_available } : item
        )
      );
      console.error("Failed to toggle item", error);
    }
  };

  const handleSaveItem = async (itemData) => {
    if (editingItem) {
      await storeAPI.updateMenuItem(editingItem.id, itemData);
    } else {
      await storeAPI.createMenuItem(STORE_ID, itemData);
    }
    await fetchMenu(true); // Refresh and sync tags to Store profile
  };

  // Group items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans pb-24">
      <header className="mb-8 px-2 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#ae2900]">Gestion des Stocks</h1>
          <p className="text-[#595c5d] font-bold tracking-widest uppercase mt-2 text-xs">
            Masquez instantanément les articles en rupture de stock
          </p>
        </div>
        <div>
          <KineticButton onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}>
            + Ajouter un article
          </KineticButton>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <p className="text-gray-500 font-bold uppercase tracking-widest">Chargement du menu...</p>
        </div>
      ) : (
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
                      label={
                        <div className="flex items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // prevent toggling the switch
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="mr-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-transform"
                            title="Modifier l'article"
                          >
                            ✏️
                          </button>
                          {item.name}
                          {item.stock_count !== null && (
                            <StockBadge count={item.stock_count} />
                          )}
                        </div>
                      } 
                      isToggled={item.is_available} 
                      onToggle={() => handleToggle(item.id)} 
                    />
                    {!item.is_available && (
                       <div className="absolute top-1/2 left-4 -translate-y-1/2 -translate-x-1 w-2 h-8 bg-red-500 rounded-full z-10 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ItemEditorModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />
    </div>
  );
}