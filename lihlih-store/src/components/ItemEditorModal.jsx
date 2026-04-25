import React, { useState, useEffect } from 'react';
import { KineticButton, OasisToast } from './UIPrimitives';
import { KineticSwitch } from './InteractiveControls';

export const OasisInput = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
  <div className="mb-4">
    <label className="block text-[#595c5d] font-bold tracking-widest uppercase mb-2 text-xs">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full bg-[#eff1f2] text-[#2c2f30] font-black tracking-tighter rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#ae2900] transition-shadow placeholder:font-normal placeholder:text-[#a0a4a6] ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
    />
  </div>
);

export const OasisSelect = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-[#595c5d] font-bold tracking-widest uppercase mb-2 text-xs">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[#eff1f2] text-[#2c2f30] font-black tracking-tighter rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#ae2900] transition-shadow appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232c2f30%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem top 50%",
        backgroundSize: "0.65rem auto",
      }}
    >
      <option value="" disabled>Sélectionnez une catégorie</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const BottomSheetModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pt-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transform transition-transform duration-300 translate-y-0 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-2xl font-black text-[#2c2f30] tracking-tighter uppercase">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#eff1f2] text-[#595c5d] rounded-full hover:bg-[#e6e8ea] transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

const PREDEFINED_CATEGORIES = [
  "Pizza",
  "Sandwichs",
  "Tacos",
  "Burgers",
  "Plats",
  "Salades",
  "Accompagnements",
  "Boissons",
  "Desserts",
  "Sauces",
  "Général"
];

export default function ItemEditorModal({ isOpen, onClose, onSave, initialData = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [isFinite, setIsFinite] = useState(false);
  const [stockCount, setStockCount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCategory(initialData.category || PREDEFINED_CATEGORIES[0]);
        setPrice(initialData.price ? initialData.price.toString() : '');
        setIsFinite(initialData.stock_count !== null);
        setStockCount(initialData.stock_count !== null ? initialData.stock_count.toString() : '');
      } else {
        setName('');
        setCategory(PREDEFINED_CATEGORIES[0]);
        setPrice('');
        setIsFinite(false);
        setStockCount('');
      }
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!name || !price) return;
    
    const parsedPrice = parseFloat(price);
    if (parsedPrice <= 0) {
      showToast("Le prix doit être strictement supérieur à 0");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({
        name,
        category: category || 'Général',
        price: parsedPrice,
        stock_count: isFinite && stockCount ? parseInt(stockCount, 10) : null
      });
      
      // Reset form
      setName('');
      setCategory(PREDEFINED_CATEGORIES[0]);
      setPrice('');
      setIsFinite(false);
      setStockCount('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <OasisToast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
      <BottomSheetModal isOpen={isOpen} onClose={onClose} title={initialData ? "Modifier l'article" : "Ajouter un article"}>
      <div className="space-y-2">
        <OasisInput 
          label="Nom de l'article" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ex: Tacos Poulet" 
        />
        
        <OasisSelect 
          label="Catégorie" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          options={PREDEFINED_CATEGORIES}
        />
        
        <OasisInput 
          label="Prix (DZD)" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          type="number" 
          placeholder="Ex: 400" 
        />

        <div className="my-6">
          <KineticSwitch
            label="Suivre la quantité exacte ?"
            isToggled={isFinite}
            onToggle={setIsFinite}
          />
        </div>

        {isFinite && (
          <OasisInput 
            label="Nombre d'articles en stock" 
            value={stockCount} 
            onChange={(e) => setStockCount(e.target.value)} 
            type="number" 
            placeholder="Ex: 50" 
          />
        )}

        <div className="mt-8">
          <KineticButton fullWidth onClick={handleSave} disabled={isSaving || !name || !price || parseFloat(price) <= 0}>
            {isSaving ? "Enregistrement..." : (initialData ? "Sauvegarder" : "Créer l'article")}
          </KineticButton>
        </div>
      </div>
    </BottomSheetModal>
    </>
  );
}
