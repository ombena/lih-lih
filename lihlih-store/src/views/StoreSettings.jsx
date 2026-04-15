import React, { useState } from 'react';
import { KineticSwitch } from '../components/InteractiveControls';
import { SurfaceCard } from '../components/UIPrimitives';
import { TrendingUp, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * StoreSettings: Vue de gestion des paramètres et analyses.
 * Permet de basculer l'état de la boutique et de suivre les performances financières.
 */
export default function StoreSettings() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Données fictives pour la phase de développement
  const dailyStats = {
    revenue: 12450,
    ordersCount: 28,
    subDaysRemaining: 45
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] p-6 pt-8 font-sans pb-24">
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
            onToggle={setIsStoreOpen} 
          />
          <p className="mt-3 ml-2 text-xs text-[#595c5d] italic">
            {isStoreOpen 
              ? "Les clients peuvent passer des commandes normalement." 
              : "Votre boutique n'apparaîtra plus dans l'application client."}
          </p>
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