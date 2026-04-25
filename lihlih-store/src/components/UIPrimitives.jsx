import React, { useEffect } from 'react';

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
  fullWidth = false,
  disabled = false
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
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
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
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.startsWith('position enregistrée')) {
      return "bg-green-100 text-green-700"; // Green for GPS success
    }

    switch(lowerStatus) {
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

/**
 * StockBadge: Small indicator for remaining inventory of finite items.
 */
export const StockBadge = ({ count }) => {
  const isLowStock = count <= 5;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ml-3 ${
      isLowStock ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
    }`}>
      Reste: {count}
    </span>
  );
};

/**
 * OasisToast: Kinetic popup message for alerts and success states.
 */
export const OasisToast = ({ message, type = 'error', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgStyles = type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-[#ae2900] shadow-orange-500/20';

  return (
    <div 
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className={`${bgStyles} text-white px-6 py-4 rounded-2xl shadow-xl font-black tracking-tighter flex items-center gap-3 w-max min-w-[250px] max-w-[90vw] justify-center`}>
        {type === 'error' && (
          <span className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 text-sm shrink-0">
            !
          </span>
        )}
        {type === 'success' && (
          <span className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 text-sm shrink-0">
            ✓
          </span>
        )}
        <span className="text-center">{message}</span>
      </div>
    </div>
  );
};