import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { OrderCard } from '../components/OrderCard';
import { SegmentedControl } from '../components/InteractiveControls';
import { storeAPI } from '../services/api'; 
import { BellRing } from 'lucide-react';


export default function KanbanBoard() {
  const { storeId } = useParams();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('En préparation');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Fetch active orders from backend on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await storeAPI.getActiveOrders(storeId); // Dynamic storeId from URL
        
        const formattedOrders = data.map(order => ({
          id: order.id.toString(),
          status: order.status,
          timeElapsed: Math.max(0, Math.floor((new Date() - new Date(order.created_at)) / 60000)),
          items: order.items.map(item => ({
            quantity: item.quantity,
            name: item.food_name || item.name
          })),
          notes: order.instructions || '',
          driver: order.driver ? { name: order.driver.name } : null,
          pickup_pin: order.pickup_pin,
          address: {
            wilaya: order.dropoff_wilaya,
            baladia: order.dropoff_baladia,
            street: order.dropoff_street
          }
        }));
        
        setOrders(formattedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);

    // NEW: Listen for the intercom shout and refresh instantly!
    window.addEventListener('refresh_kanban', fetchOrders);

    return () => {
      clearInterval(interval);
      // Clean up the listener when the component unmounts
      window.removeEventListener('refresh_kanban', fetchOrders);
    };
  }, []);

  
  const handleUnlockAudio = () => {
    // Play and immediately pause a silent beep to unlock the browser's audio engine
    const audio = new Audio('/alarm.mp3');
    audio.play().then(() => {
      audio.pause();
      setAudioUnlocked(true);
    }).catch(err => console.error("Audio unlock failed:", err));
  };

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter using English system statuses
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const waitingOrders = orders.filter(o => o.status === 'Waiting');

  const handleMarkReady = async (id) => {
    // 1. Optimistic UI update (instantly moves it on screen for a snappy feel)
    setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: 'Waiting' } : o));
    
    // 2. Actually tell the database! (Prevents the 15-second teleport bug)
    try {
      await storeAPI.markOrderReady(id);
    } catch (error) {
      console.error("Failed to update DB, reverting UI...");
      // Optional: If the request fails, you could revert the UI back to 'Preparing' here
    }
  };

  const renderColumn = (title, columnOrders) => (
    <div className="flex-1 bg-[#eff1f2] rounded-3xl p-6 min-h-[70vh]">
      <h2 className="text-[#595c5d] font-black tracking-widest uppercase mb-6 flex items-center justify-between">
        {title}
        <span className="bg-[#ae2900] text-white text-xs px-3 py-1 rounded-full">
          {columnOrders.length}
        </span>
      </h2>
      <div className="space-y-4">
        {columnOrders.map(order => (
          <OrderCard key={order.id} order={order} onReady={handleMarkReady} />
        ))}
        {columnOrders.length === 0 && (
          <div className="h-48 border-4 border-dashed border-[#ddddf9] rounded-2xl flex items-center justify-center">
            <p className="text-[#abadae] font-bold uppercase tracking-widest text-sm">
              Rien pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans relative">
      
      {/* NEW: The Audio Unlock Banner */}
      {!audioUnlocked && (
        <div className="absolute top-0 left-0 right-0 bg-[#ae2900] text-white p-4 flex justify-center items-center gap-4 z-50 shadow-md">
          <p className="font-bold">⚠️ Le son des alarmes est bloqué par le navigateur.</p>
          <button 
            onClick={handleUnlockAudio}
            className="bg-white text-[#ae2900] px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <BellRing size={16} /> Activer le son
          </button>
        </div>
      )}
      <header className="mb-8 flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#ae2900]">Tableau de cuisine</h1>
          <p className="text-[#595c5d] font-bold tracking-widest uppercase mt-2 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Prise de commandes
          </p>
        </div>
      </header>

      {isMobile ? (
        <div className="space-y-6">
          <SegmentedControl 
            options={['En préparation', 'En attente']} 
            activeOption={activeTab} 
            onChange={setActiveTab} 
          />
          <div className="pb-24">
            {activeTab === 'En préparation' 
              ? preparingOrders.map(order => <OrderCard key={order.id} order={order} onReady={handleMarkReady} />)
              : waitingOrders.map(order => <OrderCard key={order.id} order={order} onReady={handleMarkReady} />)
            }
            {activeTab === 'En préparation' && preparingOrders.length === 0 && (
              <p className="text-center text-[#abadae] font-bold mt-12 uppercase tracking-widest">Tout est prêt !</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-8 max-w-7xl">
          {renderColumn("En préparation", preparingOrders)}
          {renderColumn("En attente (Livreur)", waitingOrders)}
        </div>
      )}
    </div>
  );
}