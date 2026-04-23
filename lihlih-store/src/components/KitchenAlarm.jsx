import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { storeAPI } from '../services/api'; // 1. Import the API service

// Change this to your backend's IP address if testing on a physical tablet
const SOCKET_URL = 'http://localhost:3000'; 

/**
 * KitchenAlarm: The overriding UI overlay that locks the app when an order arrives.
 * Features massive touch targets and high contrast for fast-paced environments.
 */
export default function KitchenAlarm({ storeId = 1, onOrderAccepted }) {
  const [incomingOrder, setIncomingOrder] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the ringing sound (Make sure to add a loud alarm.mp3 to your public/ folder)
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = true;

    // 2. Connect to the Node.js Backend
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('🔌 Connected to LihLih Real-Time Engine');
      // 3. Join the specific store's room so we don't hear other restaurants' orders
      socket.emit('join_store_room', storeId);
    });

    // 4. Listen for the backend 'new_order' broadcast
    socket.on('new_order', (data) => {
      console.log('🚨 NEW ORDER EVENT:', data);
      setIncomingOrder(data.order);
      
      // Attempt to play the loud alarm sound
      audioRef.current?.play().catch(err => {
        console.warn("Browser blocked audio autoplay. User must interact with the screen first.", err);
      });
    });

    return () => {
      socket.disconnect();
      audioRef.current?.pause();
    };
  }, [storeId]);

  const handleAccept = async () => {
    // Stop the ringing
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    
    try {
      // Phase 5: Trigger Axios PATCH to update DB to 'Preparing'
      await storeAPI.acceptOrder(incomingOrder.id);
      
      // Pass the order data up to the Kanban board so it appears in "Preparing"
      if (onOrderAccepted) {
        onOrderAccepted(incomingOrder);
      }
    } catch (error) {
      console.error("Could not reach backend to accept order:", error);
    } finally {
      // Hide the alarm overlay
      setIncomingOrder(null);
    }
  };

  const handleReject = async () => {
    // Stop the ringing
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    
    try {
      // Phase 5: Trigger Axios PATCH to update DB to 'Cancelled'
      await storeAPI.rejectOrder(incomingOrder.id);
    } catch (error) {
      console.error("Could not reach backend to reject order:", error);
    } finally {
      // Hide the alarm
      setIncomingOrder(null);
    }
  };

  // If there is no incoming order, render absolutely nothing (stay hidden in the background)
  if (!incomingOrder) return null;

  // --- THE FULL SCREEN ALARM OVERLAY ---
  return (
    <div className="fixed inset-0 z-[100] bg-[#ae2900]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#ffebd9] rounded-[3rem] p-8 w-full max-w-2xl shadow-2xl flex flex-col items-center text-center">
        
        {/* Flashing Header */}
        <div className="animate-pulse mb-2">
          <h1 className="text-4xl md:text-6xl font-black text-[#ae2900] tracking-tighter uppercase">
            🚨 New Order!
          </h1>
        </div>
        
        <h2 className="text-7xl md:text-8xl font-black text-[#2c2f30] tracking-tighter mb-8">
          #{incomingOrder.id}
        </h2>
        
        {/* Massive Item List for easy reading from a distance */}
        <div className="w-full bg-white rounded-3xl p-6 mb-8 text-left space-y-4 shadow-inner max-h-[40vh] overflow-y-auto">
          {incomingOrder.items?.map((item, idx) => (
            <div key={idx} className="flex items-start text-2xl md:text-3xl leading-tight">
              <span className="font-black text-[#ae2900] mr-4">{item.quantity}x</span>
              <span className="font-bold text-[#2c2f30]">{item.food_name}</span>
            </div>
          ))}
          {/* Fallback for testing if items array is empty */}
          {(!incomingOrder.items || incomingOrder.items.length === 0) && (
            <div className="text-xl font-bold text-gray-400">Loading items...</div>
          )}
        </div>

        {/* Giant Fat-Finger Action Buttons */}
        <div className="flex flex-col w-full gap-4">
          <button 
            onClick={handleAccept}
            className="w-full h-24 bg-green-500 rounded-2xl text-white font-black text-2xl md:text-3xl uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
          >
            Accept (Start Cooking)
          </button>
          <button 
            onClick={handleReject}
            className="w-full h-16 bg-transparent text-[#ae2900] border-4 border-[#ae2900] rounded-2xl font-black text-lg md:text-xl uppercase tracking-widest active:scale-95 transition-transform"
          >
            Reject (Out of Stock)
          </button>
        </div>

      </div>
    </div>
  );
}