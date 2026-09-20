import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Smartphone, 
  MessageSquareText, 
  Upload, 
  X, 
  ArrowRight, 
  CheckCircle, 
  Bot, 
  FileSpreadsheet,
  PackageCheck,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

import { UserRole } from '../types';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
  onOpenImportCsv: () => void;
  onOpenExport: () => void;
  userRole?: UserRole;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenChat,
  onOpenImportCsv,
  onOpenExport,
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'metrics' | 'chat' | 'csv'>('sales');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const isPartner = userRole === 'partner';

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('pilotage_welcome_seen', 'true');
      } catch (e) {
        console.error('Failed to set localStorage', e);
      }
    }
    onClose();
  };

  const allTabs = [
    {
      id: 'sales' as const,
      label: '1. Analyse des Ventes',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      id: 'metrics' as const,
      label: '2. Répartition par Support',
      icon: Smartphone,
      color: 'text-blue-600',
    },
    {
      id: 'chat' as const,
      label: "3. Chat d'Analyse IA",
      icon: MessageSquareText,
      color: 'text-emerald-600',
    },
    {
      id: 'csv' as const,
      label: '4. Importation CSV',
      icon: Upload,
      color: 'text-amber-600',
      adminOnly: true,
    },
  ];

  const tabs = isPartner ? allTabs.filter((t) => !t.adminOnly) : allTabs;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      id="welcome-modal-backdrop"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-scale-up"
        id="welcome-modal-window"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-sm sm:text-base text-white tracking-tight">
                  Bienvenue sur votre Espace de Pilotage Commercial & Stocks IA
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Directeur des Ventes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Guide de découverte : découvrez comment maximiser votre marge nette et arbitrer vos décisions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer le guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content by Tab */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Tab 1: Sales Analysis */}
          {activeTab === 'sales' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start space-x-3.5 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-indigo-950">
                    L'Analyse Approfondie de vos Données de Vente
                  </h3>
                  <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                    Le pilotage commercial ne s'arrête pas au chiffre d'affaires brut. Notre moteur calcule la rentabilité nette réelle en intégrant immédiatement le coût des retours clients et l'immobilisation des stocks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    CA Brut vs CA Net Réel
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Sur un volume brut de <strong>176 400 $</strong>, les retours marchandises (notamment les 36% constatés sur le Baggy Cargo) amputent <strong>28 230 $</strong> de marge nette. Vous visualisez instantanément le manque à gagner exact.
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Vélocité Journalière & Délais Fournisseurs
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Chaque référence suit son rythme de vente moyen par jour. Le système anticipe le jour exact d'épuisement du stock et le compare au délai de fabrication du fournisseur (ex : rupture à J+8 vs 18j de délai).
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Découvrez l'onglet <strong>Vue d'Ensemble</strong> pour explorer vos 6 références en direct.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <span>Étape suivante</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Metrics by Device */}
          {activeTab === 'metrics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start space-x-3.5 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <Smartphone className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-blue-950">
                    La Répartition des Métriques par Support (Mobile, Tablette, Desktop)
                  </h3>
                  <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                    Vos clients n'achètent pas de la même manière selon leur écran. Comprendre ces écarts permet d'ajuster les budgets publicitaires et l'expérience utilisateur.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-900 flex items-center mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5" />
                    Mobile (56% du trafic)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Taux de conversion : <strong>2,4%</strong>. Panier moyen : <strong>72 $</strong>. Taux de retour élevé (42% sur le Cargo) dû à l'affichage tronqué du guide des tailles sur écran réduit.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-900 flex items-center mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    Desktop (32% du trafic)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Taux de conversion : <strong>3,5% à 5,5%</strong>. Panier moyen : <strong>91 $</strong> (+19 $ vs Mobile). C'est votre canal le plus rentable pour les campagnes d'acquisition Paid Search.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-900 flex items-center mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                    Tablette (12% du trafic)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Taux de conversion : <strong>2,9%</strong>. Panier moyen : <strong>88 $</strong>. Segment stable représentant une clientèle fidèle privilégiant le confort visuel.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Consultez l'onglet <strong>Ventes par Support</strong> pour tester les filtres croisés.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Découvrir le Chat IA</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Analysis Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start space-x-3.5 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <MessageSquareText className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-emerald-950">
                    Le Chat d'Analyse & Copilote Décisionnel IA
                  </h3>
                  <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                    Propulsé par <strong>Gemini 2.5 Flash</strong>, le chat d'analyse est relié en temps réel à vos 6 produits, vos retours clients et vos bons de commande fournisseurs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="font-bold text-xs text-slate-900 flex items-center">
                    <Bot className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Double modalité d'accès
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ouvrez la <strong>Fenêtre de Chat flottante</strong> à tout moment via le bouton permanent en bas à droite, ou basculez vers l'onglet <strong>Chat d'Analyse IA</strong> pour un espace de travail plein écran avec le volet de métriques en direct.
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="font-bold text-xs text-slate-900 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Exemples de questions stratégiques
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <em>« Faut-il recommander le Baggy Cargo malgré les 36% de retours ? »</em><br />
                    <em>« Quels bons de commande valider en priorité ce matin ? »</em>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">
                  Envie de tester immédiatement ?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenChat();
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Ouvrir la Fenêtre de Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: CSV Import (Admin only) */}
          {activeTab === 'csv' && !isPartner && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start space-x-3.5 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                <Upload className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    L'Importation Simplifiée de Fichiers CSV
                  </h3>
                  <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                    Injectez vos propres catalogues produits, volumes de ventes et stocks directement dans l'application pour que les tableaux de bord et le Chat IA travaillent sur vos données réelles.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="font-bold text-xs text-slate-900 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Format et colonnes acceptés
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fichiers séparés par des virgules ou points-virgules avec les en-têtes :{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono text-[11px]">
                      nom, categorie, commandes, panier_moyen, taux_retour, stock, fournisseur, delai_jours
                    </code>.
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="font-bold text-xs text-slate-900 flex items-center">
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    Glisser-déposer ou sélection au clic
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prévisualisez les lignes détectées avant de valider l'actualisation globale du tableau de bord.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">
                  Prêt à charger vos données ?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenImportCsv();
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  <span>Lancer l'Importation CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="cb-dont-show-welcome-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900"
            />
            <span>Ne plus afficher automatiquement au démarrage</span>
          </label>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              id="btn-close-welcome-modal"
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <span>Accéder au Tableau de Bord</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
