import React, { useState, useEffect } from 'react';
import { OrderCard } from '../components/OrderCard';
import { SegmentedControl } from '../components/InteractiveControls';

// Mock Data for Phase 2 Development
const MOCK_ORDERS = [
  { 
    id: '8492', 
    status: 'En préparation', 
    timeElapsed: 12, 
    items: [
      { quantity: 2, name: 'Tacos Poulet (Size M)' }, 
      { quantity: 1, name: 'Canette Coca-Cola' }
    ], 
    notes: 'Sans Harissa, extra sauce fromagère svp', 
    driver: null 
  },
  { 
    id: '8493', 
    status: 'En préparation', 
    timeElapsed: 5, 
    items: [
      { quantity: 1, name: 'Pizza Carrée' }
    ], 
    notes: '', 
    driver: { name: 'Karim D.' } 
  },
  { 
    id: '8490', 
    status: 'En attente', 
    timeElapsed: 25, 
    items: [
      { quantity: 3, name: 'Tacos Viande Hachée (Size L)' }
    ], 
    notes: '', 
    driver: { name: 'Amine Z.' } 
  }
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState('En préparation');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const preparingOrders = orders.filter(o => o.status === 'En préparation');
  const waitingOrders = orders.filter(o => o.status === 'En attente');

  const handleMarkReady = (id) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: 'En attente' } : o));
  };

  const renderColumn = (title, columnOrders) => (
    <div className="flex-1 bg-[#eff1f2] rounded-[2.5rem] p-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-black text-[#2c2f30] tracking-tighter">{title}</h2>
        <span className="bg-[#ddddf9] text-[#4d4e65] px-4 py-1.5 rounded-xl text-sm font-black tracking-widest">
          {columnOrders.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-10 scrollbar-hide">
        {columnOrders.map(order => (
          <OrderCard key={order.id} order={order} onReady={handleMarkReady} />
        ))}
        {columnOrders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#abadae] opacity-60 pb-20">
            <span className="text-6xl mb-4">🍽️</span>
            <p className="font-black tracking-widest uppercase text-sm">Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans">
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
        <div className="flex gap-8">
          {renderColumn('En préparation', preparingOrders)}
          {renderColumn('En attente', waitingOrders)}
        </div>
      )}
    </div>
  );
}