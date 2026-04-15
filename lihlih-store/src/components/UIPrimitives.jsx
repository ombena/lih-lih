import React from 'react';

/**
 * SurfaceCard: The tonal container without borders.
 * Uses high-contrast white on the light-grey background to define boundaries.
 */
export const SurfaceCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[2.5rem] p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

/**
 * KineticButton: Giant touch targets optimized for "Fat Finger" kitchen usage.
 * Includes specific 'accept' (Green) and 'reject' (Red) variants for the alarm screen.
 */
export const KineticButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  fullWidth = false
}) => {
  const baseStyle = "h-[56px] px-8 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center transition-transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-br from-[#ae2900] to-[#ff7855] text-white shadow-lg shadow-orange-500/20",
    accept: "bg-green-500 text-white shadow-lg shadow-green-500/30 text-lg", // Larger text for kitchen rush
    reject: "bg-red-50 text-red-600 border border-red-100", 
    secondary: "bg-[#ddddf9] text-[#4d4e65]"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * StatusBadge: High-contrast pills for identifying order states on the Kanban board.
 */
export const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch(status?.toLowerCase()) {
      case 'en préparation':
        return "bg-[#ffebd9] text-[#ae2900]"; // Orange/Gold
      case 'en attente':
      case 'prêt':
        return "bg-green-100 text-green-700"; // Green
      case 'en suspens':
        return "bg-[#ddddf9] text-[#4d4e65]"; // Purple
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter inline-block ${getStyles()}`}>
      {status}
    </span>
  );
};