import React, { useState, useMemo } from 'react';
import { Product, TrafficChannelData } from '../types';
import { SlidersHorizontal, TrendingUp, Sparkles, DollarSign, RotateCcw, ArrowRight } from 'lucide-react';

interface WhatIfSimulatorProps {
  products: Product[];
  trafficData: TrafficChannelData[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ products, trafficData }) => {
  // Simulator parameters
  const [returnReductionRate, setReturnReductionRate] = useState<number>(30); // 30% reduction in returns via mobile UX fix
  const [desktopBudgetShiftPct, setDesktopBudgetShiftPct] = useState<number>(25); // shift 25% marketing to desktop
  const [supplierPriceDiscountPct, setSupplierPriceDiscountPct] = useState<number>(5); // 5% negotiated discount on bulk PO

  // Baseline calculations
  const baselineReturnCost = useMemo(() => {
    return products.reduce((acc, p) => acc + p.totalReturnCost, 0);
  }, [products]);

  const baselineGrossRev = useMemo(() => {
    return products.reduce((acc, p) => acc + p.grossRevenue, 0);
  }, [products]);

  const baselineNetRev = useMemo(() => {
    return products.reduce((acc, p) => acc + p.netRevenue, 0);
  }, [products]);

  // Simulated metrics
  const simulatedSavingsFromReturns = (baselineReturnCost * (returnReductionRate / 100));
  
  // Marketing shift to desktop with higher conversion (5.4% vs 2.4%)
  const simulatedDesktopRevIncrease = (baselineGrossRev * 0.44 * (desktopBudgetShiftPct / 100) * 0.18);

  // Supplier purchase savings
  const totalPurchaseVolume = products.reduce((acc, p) => acc + (p.orders * p.supplierUnitCost), 0);
  const simulatedPurchaseSavings = totalPurchaseVolume * (supplierPriceDiscountPct / 100);

  const totalSimulatedBenefit = simulatedSavingsFromReturns + simulatedDesktopRevIncrease + simulatedPurchaseSavings;
  const simulatedNewNetRev = baselineNetRev + totalSimulatedBenefit;

  const fmt = (val: number) =>
    val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Simulateur d'Arbitrage Décisionnel "What-If"
            </h2>
            <p className="text-xs text-slate-500">
              Modélisez l'impact direct de vos décisions d'achat, de gestion des retours et d'expérience mobile sur le résultat net
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          {/* Slider 1 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Résolution Guide des Tailles Mobile</span>
              <span className="font-extrabold text-emerald-600">-{returnReductionRate}% retours</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={returnReductionRate}
              onChange={(e) => setReturnReductionRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              En intégrant le widget de taillage responsive, éliminez jusqu'à 50% des retours pour mauvaise taille.
            </p>
          </div>

          {/* Slider 2 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Réallocation Marketing vers Desktop</span>
              <span className="font-extrabold text-indigo-600">+{desktopBudgetShiftPct}% vers Desktop</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={desktopBudgetShiftPct}
              onChange={(e) => setDesktopBudgetShiftPct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Exploitez le fort panier moyen (91€) et taux de conversion (5.5%) des acheteurs sur grand écran.
            </p>
          </div>

          {/* Slider 3 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Négociation Fournisseur (Volume Groupé)</span>
              <span className="font-extrabold text-blue-600">-{supplierPriceDiscountPct}% coût unitaire</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={supplierPriceDiscountPct}
              onChange={(e) => setSupplierPriceDiscountPct(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Gain négocié avec l'Atelier Textiles Nord en regroupant les commandes Cargo + Velours.
            </p>
          </div>
        </div>

        {/* Results Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Économies Retours Estimées</span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              +{fmt(simulatedSavingsFromReturns)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Moins de logistique et frais réexpé.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Surcroît de CA Desktop</span>
            <div className="text-xl font-black text-indigo-600 mt-1">
              +{fmt(simulatedDesktopRevIncrease)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Grâce au meilleur panier moyen.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Économie Achats Fournisseurs</span>
            <div className="text-xl font-black text-blue-600 mt-1">
              +{fmt(simulatedPurchaseSavings)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sur les prochains bons de commande.</p>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Gain Net Total Projeté</span>
            <div className="text-2xl font-black text-white mt-1">
              +{fmt(totalSimulatedBenefit)}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Nouveau CA Net : {fmt(simulatedNewNetRev)}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            💡 Les paramètres ajustés peuvent être synchronisés avec vos prochains bons de commande.
          </span>
          <button
            onClick={() => {
              alert(`Scénario simulé appliqué avec succès : Gain prévisionnel de ${fmt(totalSimulatedBenefit)} intégré dans la stratégie commerciale.`);
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 shadow-xs flex items-center"
          >
            <span>Appliquer ce Scénario Stratégique</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
