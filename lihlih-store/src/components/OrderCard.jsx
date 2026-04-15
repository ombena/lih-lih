import React from 'react';
import { Clock, User } from 'lucide-react';

/**
 * OrderCard: Represents a single kitchen ticket.
 * Built for high visibility from a distance with massive quantities.
 */
export const OrderCard = ({ order, onReady }) => {
  const isPreparing = order.status === 'En préparation';

  return (
    <div className={`bg-white rounded-[2.5rem] p-6 shadow-sm mb-4`}>
      {/* Header: ID and Timer */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-4xl font-black tracking-tighter text-on-surface">#{order.id}</h3>
        <div className={`flex items-center font-bold px-3 py-1.5 rounded-lg text-sm ${isPreparing ? 'bg-tertiary-container text-primary' : 'bg-green-100 text-green-700'}`}>
          <Clock size={16} className="mr-1.5" /> {order.timeElapsed} min
        </div>
      </div>

      {/* Items List */}
      <ul className="space-y-4 mb-6">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-start text-xl leading-tight">
            <span className="font-black text-primary mr-4 text-2xl">{item.quantity}x</span>
            <span className="font-bold text-on-surface">{item.name}</span>
          </li>
        ))}
      </ul>

      {/* Client Notes */}
      {order.notes && (
        <div className="bg-tertiary-container text-primary p-4 rounded-2xl text-sm font-bold mb-6 border border-primary/10">
          ⚠️ Note : {order.notes}
        </div>
      )}

      {/* Driver Info */}
      {order.driver && (
        <div className="flex items-center gap-2 mb-6 text-on-surface-variant font-bold text-sm bg-surface-container-low p-3 rounded-xl">
          <User size={16} className="text-primary" /> 
          Coursier : {order.driver.name}
        </div>
      )}

      {/* Action Button */}
      {isPreparing ? (
        <button 
          onClick={() => onReady(order.id)}
          className="w-full h-[64px] rounded-2xl font-black text-lg tracking-widest uppercase flex items-center justify-center transition-transform active:scale-95 text-white shadow-lg shadow-primary-container/30 bg-gradient-to-br from-primary to-primary-container"
        >
          Prêt
        </button>
      ) : (
        <button 
          disabled
          className="w-full h-[56px] rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center bg-surface-container text-outline-variant cursor-not-allowed"
        >
          En attente du coursier
        </button>
      )}
    </div>
  );
};