import React from 'react';
import { 
  Product, 
  TrafficChannelData, 
  CustomerReview, 
  StockAlert 
} from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  FileSpreadsheet, 
  Bot, 
  ShieldCheck, 
  ShoppingBag,
  Star,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface PartnerSummaryViewProps {
  products: Product[];
  trafficData: TrafficChannelData[];
  reviews: CustomerReview[];
  alerts: StockAlert[];
  onOpenExport: () => void;
  onOpenChat: () => void;
}

export const PartnerSummaryView: React.FC<PartnerSummaryViewProps> = ({
  products,
  trafficData,
  reviews,
  alerts,
  onOpenExport,
  onOpenChat,
}) => {
  // Aggregate financial metrics
  const totalGross = products.reduce((acc, p) => acc + p.grossRevenue, 0);
  const totalNet = products.reduce((acc, p) => acc + p.netRevenue, 0);
  const totalOrders = products.reduce((acc, p) => acc + p.orders, 0);
  const totalReturnsUnits = products.reduce((acc, p) => acc + p.returnsUnits, 0);
  const totalReturnCost = products.reduce((acc, p) => acc + p.totalReturnCost, 0);
  const overallReturnRate = (totalReturnsUnits / totalOrders) * 100;
  const averageAov = totalGross / totalOrders;

  // Aggregate traffic & devices
  const mobileSessions = trafficData.filter((t) => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.sessions, 0);
  const desktopSessions = trafficData.filter((t) => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.sessions, 0);
  const tabletSessions = trafficData.filter((t) => t.deviceCategory === 'tablet').reduce((acc, t) => acc + t.sessions, 0);
  const totalSessions = mobileSessions + desktopSessions + tabletSessions;

  const mobileRev = trafficData.filter((t) => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.purchaseRevenue, 0);
  const desktopRev = trafficData.filter((t) => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.purchaseRevenue, 0);
  const tabletRev = trafficData.filter((t) => t.deviceCategory === 'tablet').reduce((acc, t) => acc + t.purchaseRevenue, 0);

  const mobileTx = trafficData.filter((t) => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.transactions, 0);
  const desktopTx = trafficData.filter((t) => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.transactions, 0);
  const tabletTx = trafficData.filter((t) => t.deviceCategory === 'tablet').reduce((acc, t) => acc + t.transactions, 0);

  const mobileConv = ((mobileTx / mobileSessions) * 100).toFixed(2);
  const desktopConv = ((desktopTx / desktopSessions) * 100).toFixed(2);
  const tabletConv = ((tabletTx / tabletSessions) * 100).toFixed(2);

  const avgReviewRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in" id="partner-final-summary-view">
      {/* Partner View Clean Header Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Vue Partenaire Commercial (Lecture Seule)
            </span>
            <span className="text-slate-400 text-xs">• Données consolidées en temps réel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Synthèse Commerciale & Résumé Final
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Rapport consolidé des ventes nettes, de la rentabilité par canal et des indicateurs de satisfaction du catalogue. Les paramètres administratifs et commandes fournisseurs sont masqués pour ce profil.
          </p>
        </div>

        {/* Action buttons reserved for partners (export & chat consultation) */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            id="btn-partner-open-chat"
            onClick={onOpenChat}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md cursor-pointer"
            title="Consulter le Copilote IA pour analyser les chiffres clés"
          >
            <Bot className="w-4 h-4 mr-1.5" />
            <span>Chatter avec l'IA</span>
          </button>

          <button
            type="button"
            id="btn-partner-export-summary"
            onClick={onOpenExport}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all shadow-sm cursor-pointer"
            title="Exporter le résumé en tableur ou par e-mail"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>Exporter le Résumé</span>
          </button>
        </div>
      </div>

      {/* 1. Global KPI Cards (Final Financial Performance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Net */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chiffre d'Affaires Net Réel
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12,4% vs N-1
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            CA Brut : {totalGross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Volume de Commandes & Panier Moyen */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Commandes & Panier Moyen
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalOrders.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">cmd</span>
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              AOV {averageAov.toFixed(0)} €
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            6 références au catalogue actif
          </p>
        </div>

        {/* Impact Retours Marchandises */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taux de Retour Global
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 tracking-tight">
              {overallReturnRate.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-rose-600">
              {totalReturnsUnits} pièces
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Coût logistique : -{totalReturnCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Note Moyenne & Satisfaction */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Satisfaction Client
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
              {avgReviewRating} <span className="text-xs font-normal text-slate-500 ml-1">/ 5</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {reviews.filter((r) => r.sentiment === 'positive').length} avis positifs
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Basé sur {reviews.length} retours vérifiés
          </p>
        </div>
      </div>

      {/* 2. Device Breakdown & Channel Performance */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Répartition des Performances par Support
            </h2>
            <p className="text-xs text-slate-500">
              Comparatif des volumes de sessions, taux de conversion et valeur de panier selon le terminal
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            {totalSessions.toLocaleString('fr-FR')} sessions totales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mobile Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Support Mobile</h3>
                  <span className="text-[11px] text-slate-500 font-medium">56% du trafic</span>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Conv : {mobileConv}%
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Chiffre d'Affaires :</span>
                <span className="font-bold text-slate-900">{mobileRev.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Panier Moyen :</span>
                <span className="font-bold text-slate-900">72 €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commandes :</span>
                <span className="font-mono text-slate-900">{mobileTx}</span>
              </div>
            </div>
          </div>

          {/* Desktop Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Support Desktop</h3>
                  <span className="text-[11px] text-slate-500 font-medium">32% du trafic</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Conv : {desktopConv}%
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Chiffre d'Affaires :</span>
                <span className="font-bold text-slate-900">{desktopRev.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Panier Moyen :</span>
                <span className="font-bold text-slate-900">91 € (+19€ vs mobile)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commandes :</span>
                <span className="font-mono text-slate-900">{desktopTx}</span>
              </div>
            </div>
          </div>

          {/* Tablet Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Support Tablette</h3>
                  <span className="text-[11px] text-slate-500 font-medium">12% du trafic</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                Conv : {tabletConv}%
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Chiffre d'Affaires :</span>
                <span className="font-bold text-slate-900">{tabletRev.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Panier Moyen :</span>
                <span className="font-bold text-slate-900">88 €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commandes :</span>
                <span className="font-mono text-slate-900">{tabletTx}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Catalog Consolidated Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Performance Consolidée des Produits (6 Références)
            </h2>
            <p className="text-xs text-slate-500">
              Chiffre d'affaires brut, déductions nettes et statut de disponibilité
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            Tableau certifié partenaire
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-4 py-3">Produit & Catégorie</th>
                <th className="px-3 py-3 text-right">Commandes</th>
                <th className="px-3 py-3 text-right">CA Brut</th>
                <th className="px-3 py-3 text-right">Taux Retour</th>
                <th className="px-3 py-3 text-right">Coût Retours</th>
                <th className="px-3 py-3 text-right">CA Net Réel</th>
                <th className="px-4 py-3 text-center">Disponibilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {products.map((p) => {
                const stockAutonomyDays = (p.currentStock / p.dailyVelocity).toFixed(0);
                const isLowStock = parseInt(stockAutonomyDays, 10) < 10;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.category}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {p.orders.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-slate-900">
                      {p.grossRevenue.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.returnRate > 0.25 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {(p.returnRate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-rose-600">
                      -{p.totalReturnCost.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-black text-emerald-700">
                      {p.netRevenue.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Stock Limité ({p.currentStock} u.)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                          En Stock ({p.currentStock} u.)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Strategic Executive Summary Insights for Partners */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-slate-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-sm text-slate-900">
            Recommandations & Points Clés Exécutifs (Directeur des Ventes & Partenaires)
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500 font-bold text-base leading-none">•</span>
            <span>
              <strong>Rentabilité Desktop vs Mobile :</strong> Le canal Desktop présente une rentabilité unitaire supérieure (+19 € de panier moyen et 4,2% de conversion), ce qui en fait le canal à privilégier pour les campagnes d'acquisition communes.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500 font-bold text-base leading-none">•</span>
            <span>
              <strong>Optimisation des retours sur le Baggy Cargo :</strong> Les 36% de retours constatés sont principalement attribuables à l'affichage mobile du guide des tailles. Une mise à jour UX est planifiée pour récupérer environ 11 340 € de marge nette.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500 font-bold text-base leading-none">•</span>
            <span>
              <strong>Continuité d'approvisionnement :</strong> 5 références sur 6 disposent d'un niveau de couverture sécurisé supérieur à 30 jours, garantissant une régularité de livraison optimale pour l'ensemble des partenaires commerciaux.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
