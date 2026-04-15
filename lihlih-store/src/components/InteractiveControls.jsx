import React from 'react';

/**
 * KineticSwitch: The massive toggle for stock availability and store open/close.
 * Optimized for quick, imprecise taps in a fast-paced kitchen environment.
 */
export const KineticSwitch = ({ isToggled, onToggle, label, disabled = false }) => {
  return (
    <div 
      className={`flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm transition-transform ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
      onClick={() => !disabled && onToggle(!isToggled)}
    >
      <span className="text-lg font-black tracking-tighter text-[#2c2f30] select-none">
        {label}
      </span>
      <div 
        className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isToggled ? 'bg-[#ae2900]' : 'bg-[#e6e8ea]'
        }`}
      >
        <div 
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
            isToggled ? 'translate-x-8' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};

/**
 * SegmentedControl: Large tabs for switching between views on mobile (e.g., Preparing vs Waiting).
 * Uses a soft background with a stark white pill for the active state to ensure high contrast.
 */
export const SegmentedControl = ({ options, activeOption, onChange }) => {
  return (
    <div className="flex bg-[#eff1f2] p-1.5 rounded-2xl w-full">
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 select-none ${
              isActive 
                ? 'bg-white text-[#ae2900] shadow-sm' 
                : 'text-[#595c5d] hover:text-[#2c2f30]'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};