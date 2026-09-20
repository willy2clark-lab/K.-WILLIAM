import React from 'react';
import { 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  SlidersHorizontal,
  BellRing,
  RefreshCw,
  ShoppingBag,
  PackageCheck,
  FileSpreadsheet
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  onOpenCopilot: () => void;
  onOpenExport: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMobileSimulator,
  setIsMobileSimulator,
  onOpenCopilot,
  onOpenExport,
  onRefreshData,
  isRefreshing,
  alertCount,
}) => {
  const tabs = [
    { id: 'overview', label: 'Vue d\'Ensemble', icon: TrendingUp },
    { id: 'devices', label: 'Ventes par Support (Mobile/Desktop)', icon: Smartphone },
    { id: 'stock', label: 'Stocks & Prédictions J+30', icon: PackageCheck },
    { id: 'suppliers', label: 'Achats Fournisseurs & PO', icon: ShoppingBag },
    { id: 'reviews', label: 'Avis Clients & Risque Retours', icon: RotateCcw },
    { id: 'whatif', label: 'Simulateur "What-If"', icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="text-emerald-400">S</span>P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  StockPilot
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  IA Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tour de contrôle commerciale • E-Commerce propre & multi-devices
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Simulator Toggle */}
            <button
              id="btn-toggle-mobile-simulator"
              onClick={() => setIsMobileSimulator(!isMobileSimulator)}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isMobileSimulator
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Basculer entre la vue complète ordinateur et la vue assistant mobile de déplacement"
            >
              {isMobileSimulator ? (
                <>
                  <Monitor className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Mode Bureau</span>
                  <span className="sm:hidden">Bureau</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  <span className="hidden sm:inline">Simulateur Mobile</span>
                  <span className="sm:hidden">Mobile</span>
                </>
              )}
            </button>

            {/* Export Daily Spreadsheet Button */}
            <button
              id="btn-open-export-modal"
              onClick={onOpenExport}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-colors"
              title="Exporter les résultats journaliers au format tableur (Excel / Sheets)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span className="hidden sm:inline">Exporter Journalier</span>
              <span className="sm:hidden">Export</span>
            </button>

            {/* AI Sales Copilot Button */}
            <button
              id="btn-open-ai-copilot"
              onClick={onOpenCopilot}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Copilote IA</span>
            </button>

            {/* Refresh Sync */}
            <button
              id="btn-refresh-data"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Actualiser les données de vente"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Desktop View */}
        {!isMobileSimulator && (
          <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {tab.label}
                  {tab.id === 'stock' && alertCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
