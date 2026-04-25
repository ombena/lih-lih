import React, { useState, useEffect } from 'react';
import { KineticSwitch } from '../components/InteractiveControls';
import { SurfaceCard, KineticButton, StatusBadge, OasisToast } from '../components/UIPrimitives';
import { TrendingUp, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';
import { OasisInput } from '../components/ItemEditorModal';
import { storeAPI } from '../services/api';

export default function StoreSettings() {
  const [store, setStore] = useState(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  
  // Profile form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [baladia, setBaladia] = useState('');
  const [street, setStreet] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [manualGPS, setManualGPS] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' });

  const STORE_ID = 1; // Hardcoded for MVP

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeAPI.getStore(STORE_ID);
        setStore(data);
        setIsStoreOpen(data.is_open);
        setName(data.name || '');
        setPhoneNumber(data.phone_number || '');
        setWilaya(data.wilaya || '');
        setBaladia(data.baladia || '');
        setStreet(data.street || '');
        setLat(data.lat || null);
        setLng(data.lng || null);
        if (data.lat && data.lng) {
          setManualGPS(`${data.lat}, ${data.lng}`);
        }
      } catch (error) {
        console.error("Failed to load store", error);
      }
    };
    fetchStore();
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ isVisible: true, message, type });
  };

  const handleToggleStatus = async (newState) => {
    try {
      await storeAPI.toggleStoreStatus(STORE_ID, newState);
      setIsStoreOpen(newState);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur lors du changement de statut", "error");
    }
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      showToast("La géolocalisation n'est pas supportée par votre navigateur", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setManualGPS(`${position.coords.latitude}, ${position.coords.longitude}`);
      },
      (error) => {
        showToast("Veuillez autoriser l'accès à votre position GPS", "error");
      }
    );
  };

  const handlePasteGPS = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManualGPS(text);
    } catch (err) {
      showToast("Impossible d'accéder au presse-papiers. Veuillez coller manuellement.", "error");
    }
  };

  const handleSaveProfile = async () => {
    let finalLat = lat;
    let finalLng = lng;

    if (manualGPS) {
      const coordsMatch = manualGPS.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
      if (coordsMatch) {
        finalLat = parseFloat(coordsMatch[1]);
        finalLng = parseFloat(coordsMatch[2]);
        setLat(finalLat);
        setLng(finalLng);
      } else {
        showToast("Format GPS invalide. Utilisez: Latitude, Longitude", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const updatedStore = await storeAPI.updateStoreProfile(STORE_ID, {
        name,
        phone_number: phoneNumber,
        wilaya,
        baladia,
        street,
        lat: finalLat,
        lng: finalLng
      });
      setStore(updatedStore);
      showToast("Profil enregistré avec succès", "success");
    } catch (error) {
      showToast("Erreur lors de l'enregistrement du profil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isProfileComplete = lat !== null && lng !== null && phoneNumber !== '' && phoneNumber !== null;

  // Données fictives pour la phase de développement
  const dailyStats = {
    revenue: 12450,
    ordersCount: 28,
    subDaysRemaining: 45
  };

  if (!store) return <div className="p-6 text-gray-500 font-bold uppercase tracking-widest">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans pb-24">
      <OasisToast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      <header className="mb-8 px-2">
        <h1 className="text-4xl font-black tracking-tighter text-[#ae2900]">Paramètres & Analyses</h1>
        <p className="text-[#595c5d] font-bold tracking-widest uppercase mt-2 text-xs">
          Gérez votre boutique et suivez vos performances
        </p>
      </header>

      <div className="max-w-3xl space-y-8">
        {/* Commutateur principal de la boutique */}
        <section>
          <h2 className="text-xs font-black text-[#595c5d] uppercase tracking-widest mb-4 ml-2">Statut de l'établissement</h2>
          <KineticSwitch 
            label={isStoreOpen ? "Boutique Ouverte" : "Boutique Fermée"} 
            isToggled={isStoreOpen} 
            onToggle={handleToggleStatus} 
            disabled={!isProfileComplete}
          />
          {!isProfileComplete && (
            <div className="mt-4 p-4 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100">
              <AlertCircle size={24} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-bold">
                ⚠️ Vous devez compléter votre profil et capturer votre position GPS pour recevoir des commandes.
              </p>
            </div>
          )}
          {isProfileComplete && (
            <p className="mt-3 ml-2 text-xs text-[#595c5d] italic">
              {isStoreOpen 
                ? "Les clients peuvent passer des commandes normalement." 
                : "Votre boutique n'apparaîtra plus dans l'application client."}
            </p>
          )}
        </section>

        {/* Profil de l'établissement */}
        <section>
          <h2 className="text-xs font-black text-[#595c5d] uppercase tracking-widest mb-4 ml-2">Profil de l'établissement</h2>
          <SurfaceCard className="space-y-4">
            <OasisInput 
              label="Nom de l'établissement" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: Pizzeria LihLih"
            />
            <OasisInput 
              label="Numéro de téléphone" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="Ex: 0555 12 34 56"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OasisInput 
                label="Wilaya" 
                value={wilaya} 
                onChange={(e) => setWilaya(e.target.value)} 
                placeholder="Ex: Alger"
              />
              <OasisInput 
                label="Baladia" 
                value={baladia} 
                onChange={(e) => setBaladia(e.target.value)} 
                placeholder="Ex: Hydra"
              />
            </div>
            <OasisInput 
              label="Adresse" 
              value={street} 
              onChange={(e) => setStreet(e.target.value)} 
              placeholder="Ex: 12 Rue des Oliviers"
            />
            
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[#595c5d] font-bold tracking-widest uppercase mb-4 text-xs">
                Localisation GPS
              </label>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <OasisInput 
                      label="Coordonnées manuelles" 
                      value={manualGPS} 
                      onChange={(e) => setManualGPS(e.target.value)} 
                      placeholder="Ex: 33.8011622, 2.8467833"
                      readOnly={true}
                    />
                  </div>
                  <div className="mb-4">
                    <button 
                      onClick={handlePasteGPS}
                      className="h-[48px] px-4 rounded-xl font-black text-xs tracking-widest uppercase flex items-center justify-center bg-[#ddddf9] text-[#4d4e65] hover:bg-[#d0d0f5] transition-colors"
                      title="Coller depuis le presse-papiers"
                    >
                      📋 Coller
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">OU</span>
                  <KineticButton variant="secondary" onClick={captureGPS} className="shrink-0 flex-1 h-[48px] text-xs">
                    📍 Capturer ma position actuelle
                  </KineticButton>
                </div>
                
                {lat && lng && (
                  <StatusBadge status={`Position enregistrée (${parseFloat(lat).toFixed(2)}, ${parseFloat(lng).toFixed(2)})`} />
                )}
              </div>
            </div>

            <div className="pt-6">
              <KineticButton fullWidth onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </KineticButton>
            </div>
          </SurfaceCard>
        </section>

        {/* Performance quotidienne */}
        <section>
          <h2 className="text-xs font-black text-[#595c5d] uppercase tracking-widest mb-4 ml-2">Performance du jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SurfaceCard className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-[#ffebd9] flex items-center justify-center text-[#ae2900]">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#595c5d] uppercase tracking-widest">Revenus (DA)</p>
                <p className="text-3xl font-black text-[#2c2f30] tracking-tighter">{dailyStats.revenue.toLocaleString()} DA</p>
              </div>
            </SurfaceCard>

            <SurfaceCard className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-[#ddddf9] flex items-center justify-center text-[#4d4e65]">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#595c5d] uppercase tracking-widest">Commandes</p>
                <p className="text-3xl font-black text-[#2c2f30] tracking-tighter">{dailyStats.ordersCount}</p>
              </div>
            </SurfaceCard>
          </div>
        </section>

        {/* Suivi de l'abonnement */}
        <section>
          <h2 className="text-xs font-black text-[#595c5d] uppercase tracking-widest mb-4 ml-2">Abonnement LihLih</h2>
          <SurfaceCard className="relative overflow-hidden border border-[#ae2900]/10">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#2c2f30] tracking-tight">Forfait Professionnel</h3>
                  <p className="text-sm text-green-600 font-bold uppercase tracking-widest mt-1">Actif</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#ae2900] tracking-tighter">{dailyStats.subDaysRemaining}</p>
                <p className="text-[10px] font-black text-[#595c5d] uppercase tracking-widest">Jours restants</p>
              </div>
            </div>
            
            {/* Barre de progression de l'abonnement */}
            <div className="mt-8 h-2 w-full bg-[#eff1f2] rounded-full overflow-hidden">
              <div className="h-full bg-[#ae2900] rounded-full" style={{ width: '50%' }}></div>
            </div>
            
            <div className="mt-6 p-4 bg-[#fff4eb] rounded-2xl flex items-center gap-3 border border-[#ae2900]/10">
              <AlertCircle size={20} className="text-[#ae2900]" />
              <p className="text-xs text-[#8a2000] font-bold">
                Votre abonnement se termine le 30 Mai 2026.
              </p>
            </div>
          </SurfaceCard>
        </section>
      </div>
    </div>
  );
}