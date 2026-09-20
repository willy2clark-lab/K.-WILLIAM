import React from 'react';
import { Product, TrafficChannelData } from '../types';
import { DollarSign, ShoppingCart, RotateCcw, Smartphone, TrendingUp, AlertTriangle } from 'lucide-react';

interface KpiSummaryProps {
  products: Product[];
  trafficData: TrafficChannelData[];
  onSelectProduct?: (productId: string) => void;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({ products, trafficData }) => {
  // Aggregate product numbers
  const totalGrossRevenue = products.reduce((acc, p) => acc + p.grossRevenue, 0);
  const totalNetRevenue = products.reduce((acc, p) => acc + p.netRevenue, 0);
  const totalOrders = products.reduce((acc, p) => acc + p.orders, 0);
  const totalReturnsUnits = products.reduce((acc, p) => acc + p.returnsUnits, 0);
  const totalReturnCost = products.reduce((acc, p) => acc + p.totalReturnCost, 0);
  const overallReturnRate = (totalReturnsUnits / totalOrders) * 100;

  // Aggregate device numbers from traffic data
  const mobileSessions = trafficData.filter(t => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.sessions, 0);
  const desktopSessions = trafficData.filter(t => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.sessions, 0);
  const tabletSessions = trafficData.filter(t => t.deviceCategory === 'tablet').reduce((acc, t) => acc + t.sessions, 0);
  const totalSessions = mobileSessions + desktopSessions + tabletSessions;

  const mobileRev = trafficData.filter(t => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.purchaseRevenue, 0);
  const desktopRev = trafficData.filter(t => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.purchaseRevenue, 0);
  const totalTrafficRev = trafficData.reduce((acc, t) => acc + t.purchaseRevenue, 0);

  const mobileTx = trafficData.filter(t => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.transactions, 0);
  const desktopTx = trafficData.filter(t => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.transactions, 0);

  const mobileConversion = (mobileTx / mobileSessions) * 100;
  const desktopConversion = (desktopTx / desktopSessions) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. CA Net Réel */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires Net</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {totalNetRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +12.4% vs N-1
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Brut: {totalGrossRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          <span className="text-rose-500 ml-1">(-{totalReturnCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} retours)</span>
        </p>
      </div>

      {/* 2. Commandes & Vitesse */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume de Commandes</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {totalOrders.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">cdes</span>
          </span>
          <span className="text-xs font-medium text-slate-600">
            Panier moy. {(totalGrossRevenue / totalOrders).toFixed(1)} €
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          5 catégories phares au catalogue marchand
        </p>
      </div>

      {/* 3. Taux & Coût des Retours */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux de Retour Global</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-rose-600 tracking-tight">
            {overallReturnRate.toFixed(1)}%
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 mr-0.5" /> Élevé
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {totalReturnsUnits} pièces retournées • Coût : {totalReturnCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* 4. Ratio Mobile vs Desktop */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Part Trafic & Ventes Mobile</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {((mobileSessions / totalSessions) * 100).toFixed(0)}% <span className="text-xs font-medium text-slate-500">trafic</span>
          </span>
          <span className="text-xs font-semibold text-indigo-600">
            {((mobileRev / totalTrafficRev) * 100).toFixed(0)}% CA
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
          <span>Conv. Mobile: <strong className="text-slate-800">{mobileConversion.toFixed(2)}%</strong></span>
          <span>Desktop: <strong className="text-emerald-700">{desktopConversion.toFixed(2)}%</strong></span>
        </div>
      </div>
    </div>
  );
};
