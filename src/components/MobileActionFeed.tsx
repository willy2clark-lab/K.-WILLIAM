import React from 'react';
import { DailyFeedCard, Product, PurchaseOrder } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  ShoppingBag, 
  ArrowRight, 
  Monitor,
  Flame,
  Clock,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface MobileActionFeedProps {
  feedCards: DailyFeedCard[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onDismissCard: (cardId: string) => void;
  onApprovePoQuick: (poId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onCloseMobileSimulator: () => void;
  onOpenExport?: () => void;
}

export const MobileActionFeed: React.FC<MobileActionFeedProps> = ({
  feedCards,
  purchaseOrders,
  products,
  onDismissCard,
  onApprovePoQuick,
  onNavigateToTab,
  onCloseMobileSimulator,
  onOpenExport,
}) => {
  const pendingOrders = purchaseOrders.filter((po) => po.status === 'draft');

  return (
    <div className="max-w-md mx-auto bg-slate-100 min-h-screen pb-20 shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-900 my-4">
      {/* Smartphone Top Notch & Bar */}
      <div className="bg-slate-900 text-white px-5 pt-3 pb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
          <span>09:41</span>
          <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto" />
          <div className="flex items-center space-x-1 text-slate-300">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Pilotage Quotidien IA
            </span>
            <h1 className="text-lg font-black tracking-tight text-white">Daily Sales Feed</h1>
          </div>
          <button
            onClick={onCloseMobileSimulator}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center"
            title="Quitter le simulateur mobile"
          >
            <Monitor className="w-3.5 h-3.5 mr-1" />
            Bureau
          </button>
        </div>

        {/* Quick horizontal mini-status */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 shrink-0">
            <span className="text-[10px] text-slate-400 block">CA Net 24h</span>
            <span className="font-extrabold text-white">4 820 €</span>
          </div>
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 shrink-0">
            <span className="text-[10px] text-slate-400 block">Trafic Mobile</span>
            <span className="font-extrabold text-indigo-400">58.4%</span>
          </div>
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 shrink-0">
            <span className="text-[10px] text-slate-400 block">Retours</span>
            <span className="font-extrabold text-rose-400">36% Cargo</span>
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="p-4 space-y-4">
        {/* Quick Export Spreadsheet Action on Mobile */}
        {onOpenExport && (
          <button
            id="mobile-btn-export-daily"
            onClick={onOpenExport}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center text-white">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black block">Exporter les résultats journaliers</span>
                <span className="text-[10px] text-emerald-100">Tableur Excel & Google Sheets (.CSV)</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </button>
        )}

        {/* Pending POs Alert Badge for Mobile */}
        {pendingOrders.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                Action Immédiate Requise
              </span>
              <span className="text-xs font-semibold">{pendingOrders.length} bon(s) en attente</span>
            </div>
            <h3 className="font-black text-sm">
              Réapprovisionnement critique à valider
            </h3>
            <p className="text-xs text-amber-100 mt-1">
              {pendingOrders[0].items[0].productName} : rupture prévue dans {pendingOrders[0].items[0].predictedDaysRemaining} jours.
            </p>
            <button
              id="mobile-btn-approve-po"
              onClick={() => onApprovePoQuick(pendingOrders[0].id)}
              className="mt-3 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center space-x-1"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Valider le PO de {pendingOrders[0].items[0].quantity} u. ({pendingOrders[0].totalAmount} €)</span>
            </button>
          </div>
        )}

        {/* Dynamic Cards Feed */}
        <div className="space-y-3">
          {feedCards.map((card) => {
            const isFlash = card.type === 'flash_sales';
            const isStock = card.type === 'stock_risk';
            const isSentiment = card.type === 'sentiment_anomaly';

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isStock
                        ? 'bg-rose-100 text-rose-800'
                        : isFlash
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {isStock ? (
                      <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                    ) : isFlash ? (
                      <Flame className="w-3 h-3 mr-1 text-blue-600" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                    )}
                    {card.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-0.5" /> {card.timestamp}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{card.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{card.description}</p>

                {/* Metrics chips */}
                {card.metrics && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100">
                    {card.metrics.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
                        <span className="font-extrabold text-xs text-slate-900 block mt-0.5">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card action button */}
                {card.suggestedAction && (
                  <button
                    onClick={() => {
                      if (card.suggestedAction?.actionType === 'approve_po' && card.suggestedAction.targetId) {
                        onApprovePoQuick(card.suggestedAction.targetId);
                      } else {
                        onNavigateToTab('reviews');
                      }
                    }}
                    className="mt-3 w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center space-x-1"
                  >
                    <span>{card.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
