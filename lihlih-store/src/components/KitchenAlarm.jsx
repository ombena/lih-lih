import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { storeAPI } from '../services/api';
import { X, AlertTriangle, Layers, CheckSquare, Square } from 'lucide-react';

const SOCKET_URL = 'http://localhost:3000';

export default function KitchenAlarm({ storeId = 1, onOrderAccepted }) {
  const [orderQueue, setOrderQueue] = useState([]);
  // View states: 'alarm' | 'reasons' | 'items'
  const [viewState, setViewState] = useState('alarm'); 
  const [selectedMissingItems, setSelectedMissingItems] = useState([]);
  const audioRef = useRef(null);

  const REJECTION_REASONS = [
    "En rupture de stock",
    "Ingrédient manquant",
    "Trop de commandes",
    "Fermeture imminente"
  ];

  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = true;

    const socket = io(SOCKET_URL);
    socket.on('connect', () => socket.emit('join_store_room', storeId));
    socket.on('new_order', (data) => setOrderQueue(prev => [...prev, data.order]));

    return () => {
      socket.disconnect();
      audioRef.current?.pause();
    };
  }, [storeId]);

  useEffect(() => {
    if (orderQueue.length > 0 && viewState === 'alarm') {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [orderQueue.length, viewState]);

  const processCurrentOrderAndAdvance = () => {
    setOrderQueue(prev => {
      const newQueue = [...prev];
      newQueue.shift();
      return newQueue;
    });
    setViewState('alarm'); // Reset UI for the next order
    setSelectedMissingItems([]);
  };

  const handleAccept = async () => {
    const currentOrder = orderQueue[0];
    processCurrentOrderAndAdvance(); 
    try {
      await storeAPI.acceptOrder(currentOrder.id);
      if (onOrderAccepted) onOrderAccepted(currentOrder);
      
      // NEW: Shout over the intercom to refresh the Kanban Board instantly!
      window.dispatchEvent(new CustomEvent('refresh_kanban'));
      
    } catch (error) { console.error("Accept error:", error); }
  };

  // Handles standard rejection AND moving to the Item Picker
  const handleReasonSelect = async (reason) => {
    if (reason === "Ingrédient manquant" || reason === "En rupture de stock") {
      setViewState('items'); // Move to step 3 (Item Picker)
      return;
    }
    // If it's a generic reason (e.g. Too busy), reject immediately
    executeReject(reason, []);
  };

  // The final execution function
  const executeReject = async (reason, missingItemsList) => {
    const currentOrder = orderQueue[0];
    processCurrentOrderAndAdvance();
    try {
      await storeAPI.rejectOrder(currentOrder.id, reason, missingItemsList);
    } catch (error) { console.error("Reject error:", error); }
  };

  const toggleMissingItem = (itemId) => {
    setSelectedMissingItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  if (orderQueue.length === 0) return null;
  const incomingOrder = orderQueue[0];

  return (
    <div className="fixed inset-0 z-[100] bg-[#ae2900]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {orderQueue.length > 1 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white text-[#ae2900] px-6 py-3 rounded-full font-black text-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Layers size={24} /> {orderQueue.length - 1} autre(s) commande(s) en attente !
        </div>
      )}

      <div className="bg-white rounded-[3rem] p-8 w-full max-w-xl shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
        
        {viewState === 'alarm' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-[#ae2900] uppercase animate-pulse">Nouvelle Commande!</h1>
              <span className="text-7xl font-black text-[#2c2f30]">#{incomingOrder.id}</span>
            </div>
            <div className="bg-[#eff1f2] rounded-3xl p-6 mb-8 max-h-[35vh] overflow-y-auto">
              {incomingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-start text-2xl mb-2">
                  <span className="font-black text-[#ae2900] mr-4">{item.quantity}x</span>
                  <span className="font-bold text-[#2c2f30]">{item.food_name || item.name}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={handleAccept} className="w-full h-24 bg-green-500 rounded-2xl text-white font-black text-2xl uppercase shadow-xl active:scale-95 transition-all">Accepter</button>
              <button onClick={() => setViewState('reasons')} className="w-full h-16 border-4 border-[#ae2900] text-[#ae2900] rounded-2xl font-black text-xl uppercase active:scale-95 transition-all">Refuser...</button>
            </div>
          </div>
        )}

        {viewState === 'reasons' && (
          <div className="animate-in slide-in-from-right duration-300">
            <button onClick={() => setViewState('alarm')} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-[#ae2900]" size={32} />
              <h2 className="text-2xl font-black text-[#2c2f30]">Motif du refus ?</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-8">
              {REJECTION_REASONS.map(reason => (
                <button key={reason} onClick={() => handleReasonSelect(reason)} className="w-full py-5 px-6 bg-[#eff1f2] hover:bg-[#ae2900] hover:text-white rounded-2xl text-left font-bold text-xl transition-colors active:scale-[0.98]">
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setViewState('alarm')} className="w-full py-4 text-[#595c5d] font-black uppercase tracking-widest text-sm">Retour</button>
          </div>
        )}

        {/* NEW: Step 3 - The Item Picker */}
        {viewState === 'items' && (
          <div className="animate-in slide-in-from-right duration-300">
            <button onClick={() => setViewState('reasons')} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-[#ae2900]" size={32} />
              <h2 className="text-2xl font-black text-[#2c2f30]">Qu'est-ce qui manque ?</h2>
            </div>
            <p className="text-[#595c5d] font-bold mb-6">Sélectionnez les articles indisponibles pour prévenir le client.</p>
            
            <div className="bg-[#eff1f2] rounded-3xl p-4 mb-8 max-h-[35vh] overflow-y-auto space-y-2">
              {incomingOrder.items?.map((item, idx) => {
                // Determine item ID safely based on your specific Prisma schema
                const id = item.item_id || item.id || idx; 
                const isSelected = selectedMissingItems.includes(id);
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleMissingItem(id)}
                    className={`flex items-center p-4 rounded-2xl cursor-pointer border-4 transition-all ${isSelected ? 'border-[#ae2900] bg-white' : 'border-transparent hover:bg-white'}`}
                  >
                    {isSelected ? <CheckSquare className="text-[#ae2900] mr-4" size={28} /> : <Square className="text-[#abadae] mr-4" size={28} />}
                    <span className={`font-black text-xl ${isSelected ? 'text-[#ae2900] line-through' : 'text-[#2c2f30]'}`}>
                      {item.quantity}x {item.food_name || item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <button 
              disabled={selectedMissingItems.length === 0}
              onClick={() => executeReject("Ingrédient manquant", selectedMissingItems)}
              className={`w-full h-20 rounded-2xl text-white font-black text-2xl uppercase transition-all ${selectedMissingItems.length > 0 ? 'bg-[#ae2900] shadow-xl active:scale-95' : 'bg-[#abadae] cursor-not-allowed'}`}
            >
              Confirmer le refus
            </button>
            <button onClick={() => setViewState('reasons')} className="w-full py-4 text-[#595c5d] font-black uppercase tracking-widest text-sm mt-2">Retour</button>
          </div>
        )}

      </div>
    </div>
  );
}