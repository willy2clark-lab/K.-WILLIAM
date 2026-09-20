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
  FileSpreadsheet,
  Settings,
  MessageSquareText,
  Upload,
  HelpCircle,
  UserCheck,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  onOpenCopilot: () => void;
  onOpenExport: () => void;
  onOpenImportCsv?: () => void;
  onOpenWelcome?: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  isMobileSimulator,
  setIsMobileSimulator,
  onOpenCopilot,
  onOpenExport,
  onOpenImportCsv,
  onOpenWelcome,
  onRefreshData,
  isRefreshing,
  alertCount,
}) => {
  const isPartner = userRole === 'partner';

  // Define tabs dynamically based on user role
  const allTabs = [
    { id: 'overview', label: isPartner ? 'Résumé Final & Synthèse' : 'Vue d\'Ensemble', icon: TrendingUp },
    { id: 'devices', label: isPartner ? 'Performance Supports (Mobile/Desktop)' : 'Ventes par Support (Mobile/Desktop)', icon: Smartphone },
    { id: 'stock', label: 'Stocks & Prédictions J+30', icon: PackageCheck, adminOnly: true },
    { id: 'suppliers', label: 'Achats Fournisseurs & PO', icon: ShoppingBag, adminOnly: true },
    { id: 'reviews', label: 'Avis Clients & Risque Retours', icon: RotateCcw, adminOnly: true },
    { id: 'whatif', label: 'Simulateur "What-If"', icon: SlidersHorizontal, adminOnly: true },
    { id: 'analysis-chat', label: "Chat d'Analyse IA", icon: MessageSquareText },
    { id: 'settings', label: 'Paramètres & Diagnostics', icon: Settings, adminOnly: true },
  ];

  const visibleTabs = isPartner 
    ? allTabs.filter((t) => !t.adminOnly)
    : allTabs;

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'partner') {
      setIsMobileSimulator(false);
      if (activeTab === 'settings' || activeTab === 'suppliers' || activeTab === 'whatif' || activeTab === 'stock' || activeTab === 'reviews') {
        setActiveTab('overview');
      }
    }
  };

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
            {/* User Profile / Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                id="btn-role-admin"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isPartner
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Profil Directeur des Ventes (Admin) : Vue complète, configuration, gestion des stocks et bons de commande"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span className="hidden md:inline">Directeur (Admin)</span>
                <span className="md:hidden">Admin</span>
              </button>

              <button
                type="button"
                id="btn-role-partner"
                onClick={() => handleRoleChange('partner')}
                className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isPartner
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Profil Partenaire : Résumé final et performances commerciales épurées (boutons d'administration et configuration masqués)"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-200" />
                <span>Partenaire</span>
              </button>
            </div>

            {/* Mobile Simulator Toggle (Hidden in Partner View) */}
            {!isPartner && (
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
            )}

            {/* Import CSV Button (Hidden in Partner View) */}
            {!isPartner && onOpenImportCsv && (
              <button
                id="btn-open-import-csv"
                type="button"
                onClick={onOpenImportCsv}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Importer votre propre catalogue et ventes via un fichier CSV"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
            )}

            {/* Export Daily Spreadsheet & Email Dispatch Button */}
            <button
              id="btn-open-export-modal"
              type="button"
              onClick={onOpenExport}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
              title="Exporter les résultats journaliers au format tableur (Excel / Sheets) ou envoyer par e-mail"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span className="hidden lg:inline">{isPartner ? 'Exporter Résumé' : 'Export Tableur & Mail'}</span>
              <span className="hidden sm:inline lg:hidden">Export</span>
              <span className="sm:hidden">Export</span>
            </button>

            {/* AI Sales Copilot & Analysis Chat Window Button */}
            <button
              id="btn-open-ai-copilot"
              type="button"
              onClick={onOpenCopilot}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-all cursor-pointer hover:shadow-md"
              title="Ouvrir la fenêtre de chat d'analyse IA"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Fenêtre de Chat</span>
            </button>

            {/* Welcome & Onboarding Guide Button */}
            {onOpenWelcome && (
              <button
                id="btn-open-welcome-guide"
                type="button"
                onClick={onOpenWelcome}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Guide de Bienvenue & Prise en main pour nouveaux utilisateurs"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
              </button>
            )}

            {/* Refresh Sync (Hidden in Partner View) */}
            {!isPartner && (
              <button
                id="btn-refresh-data"
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                title="Actualiser les données de vente"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            )}

            {/* Settings & System Diagnostics (Hidden in Partner View) */}
            {!isPartner && (
              <button
                id="btn-open-settings"
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-emerald-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Paramètres & Diagnostics Système"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Desktop View */}
        {!isMobileSimulator && (
          <div className="flex items-center justify-between space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-1">
            <div className="flex space-x-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
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

            {isPartner && (
              <div className="hidden lg:flex items-center space-x-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400 mr-1" />
                <span>Vue épurée : fonctions d'administration masquées</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
