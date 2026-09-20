import React, { useState } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRAFFIC_DATA, 
  INITIAL_REVIEWS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_ALERTS, 
  INITIAL_DAILY_FEED, 
  FORECAST_SERIES 
} from './data/mockData';
import { 
  Product, 
  TrafficChannelData, 
  CustomerReview, 
  PurchaseOrder, 
  StockAlert, 
  DailyFeedCard, 
  DeviceCategory, 
  AIAnalysisResult,
  UserRole
} from './types';
import { Header } from './components/Header';
import { KpiSummary } from './components/KpiSummary';
import { SalesDeviceAnalytics } from './components/SalesDeviceAnalytics';
import { StockPredictionView } from './components/StockPredictionView';
import { SupplierOrdersView } from './components/SupplierOrdersView';
import { CustomerReviewsView } from './components/CustomerReviewsView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MobileActionFeed } from './components/MobileActionFeed';
import { SalesCopilotModal } from './components/SalesCopilotModal';
import { ExportModal } from './components/ExportModal';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { AnalysisChatView } from './components/AnalysisChatView';
import { WelcomeModal } from './components/WelcomeModal';
import { CsvImportModal } from './components/CsvImportModal';
import { PartnerSummaryView } from './components/PartnerSummaryView';
import { Sparkles, Bot, AlertTriangle, CheckCircle } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [trafficData, setTrafficData] = useState<TrafficChannelData[]>(INITIAL_TRAFFIC_DATA);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [alerts, setAlerts] = useState<StockAlert[]>(INITIAL_ALERTS);
  const [feedCards, setFeedCards] = useState<DailyFeedCard[]>(INITIAL_DAILY_FEED);
  const [forecastSeries, setForecastSeries] = useState(FORECAST_SERIES);

  // User Role State: 'admin' (Directeur des ventes) or 'partner' (Partenaire commercial)
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'all' | DeviceCategory>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState<boolean>(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pilotage_welcome_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI NLP Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzingReviews, setIsAnalyzingReviews] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Actions
  const handleUpdatePoStatus = (poId: string, status: 'validated' | 'sent') => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status } : po))
    );
    showToast(
      status === 'validated'
        ? 'Bon de commande validé avec succès !'
        : 'Bon de commande transmis par e-mail au fournisseur.'
    );
  };

  const handleCreateNewPo = (newPo: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPo, ...prev]);
    showToast(`Nouveau bon de commande ${newPo.poNumber} créé.`);
  };

  const handleTriggerReorder = (productId: string) => {
    setActiveTab('suppliers');
    showToast('Redirection vers les bons de commande fournisseurs...');
  };

  const handleExecuteAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, executed: true } : a))
    );
    showToast("Action d'arbitrage exécutée et enregistrée.");
  };

  const handleAddReview = (newReview: CustomerReview) => {
    setReviews((prev) => [newReview, ...prev]);

    // If review is negative and returned, slightly update product return rate
    if (newReview.returned) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === newReview.productId) {
            const newOrders = p.orders + 1;
            const newReturnsUnits = p.returnsUnits + 1;
            const newRate = newReturnsUnits / newOrders;
            return {
              ...p,
              orders: newOrders,
              returnsUnits: newReturnsUnits,
              returnRate: newRate,
              totalReturnCost: newReturnsUnits * p.costPerReturn,
              netRevenue: p.grossRevenue - (newReturnsUnits * p.costPerReturn),
              qualityRiskScore: Math.min(100, p.qualityRiskScore + 5),
            };
          }
          return p;
        })
      );
    }
    showToast('Nouvel avis client enregistré dans le flux marchand.');
  };

  const handleRunAiAnalysis = async (): Promise<AIAnalysisResult | null> => {
    setIsAnalyzingReviews(true);
    try {
      const response = await fetch('/api/gemini/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, products }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
        showToast('Analyse sémantique NLP complétée par Gemini.');
        return data.data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingReviews(false);
    }
    return null;
  };

  const handleApprovePoQuick = (poId: string) => {
    handleUpdatePoStatus(poId, 'validated');
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Flux de ventes synchronisé avec le CMS marchand.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Navigation & Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={(role) => {
          setUserRole(role);
          if (role === 'partner') {
            setIsMobileSimulator(false);
            if (activeTab === 'settings' || activeTab === 'suppliers' || activeTab === 'whatif' || activeTab === 'stock' || activeTab === 'reviews') {
              setActiveTab('overview');
            }
          }
        }}
        isMobileSimulator={isMobileSimulator}
        setIsMobileSimulator={setIsMobileSimulator}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImportCsv={userRole === 'partner' ? undefined : () => setIsImportCsvOpen(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        alertCount={alerts.filter((a) => !a.executed).length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'partner' ? (
          /* Partner View: Clean Final Summary & Read-only Strategic Insights */
          <div>
            {/* Tab 1: Partner Final Summary */}
            {activeTab === 'overview' && (
              <PartnerSummaryView
                products={products}
                trafficData={trafficData}
                reviews={reviews}
                alerts={alerts}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenChat={() => setIsCopilotOpen(true)}
              />
            )}

            {/* Tab 2: Devices & Multi-Channel Performance */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                <SalesDeviceAnalytics
                  products={products}
                  trafficData={trafficData}
                  selectedDeviceFilter={selectedDeviceFilter}
                  setSelectedDeviceFilter={setSelectedDeviceFilter}
                  selectedCategoryFilter={selectedCategoryFilter}
                  setSelectedCategoryFilter={setSelectedCategoryFilter}
                  onOpenExport={() => setIsExportOpen(true)}
                />
              </div>
            )}

            {/* Tab 7: AI Analysis Chat for Partners */}
            {activeTab === 'analysis-chat' && (
              <AnalysisChatView
                products={products}
                trafficData={trafficData}
                reviews={reviews}
                purchaseOrders={purchaseOrders}
                alerts={alerts}
                forecastSeries={forecastSeries}
                onNotify={showToast}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}
          </div>
        ) : isMobileSimulator ? (
          /* Mobile-First Daily Feed Mode */
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                Mode Mobile Directeur des Ventes en Déplacement
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Visualisez et validez en direct vos alertes critiques, flux de ventes et bons d'achat depuis votre smartphone
              </p>
            </div>
            <MobileActionFeed
              feedCards={feedCards}
              purchaseOrders={purchaseOrders}
              products={products}
              onDismissCard={(id) => setFeedCards((prev) => prev.filter((c) => c.id !== id))}
              onApprovePoQuick={handleApprovePoQuick}
              onNavigateToTab={(t) => {
                setIsMobileSimulator(false);
                setActiveTab(t);
              }}
              onCloseMobileSimulator={() => setIsMobileSimulator(false)}
              onOpenExport={() => setIsExportOpen(true)}
            />
          </div>
        ) : (
          /* Full Desktop Dashboard Views (Director / Admin) */
          <div>
            {/* Global KPI Summary Bar */}
            <KpiSummary products={products} trafficData={trafficData} />

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SalesDeviceAnalytics
                  products={products}
                  trafficData={trafficData}
                  selectedDeviceFilter={selectedDeviceFilter}
                  setSelectedDeviceFilter={setSelectedDeviceFilter}
                  selectedCategoryFilter={selectedCategoryFilter}
                  setSelectedCategoryFilter={setSelectedCategoryFilter}
                  onOpenExport={() => setIsExportOpen(true)}
                />
                <StockPredictionView
                  products={products}
                  alerts={alerts}
                  forecastData={forecastSeries}
                  onTriggerReorder={handleTriggerReorder}
                  onExecuteAlert={handleExecuteAlert}
                  onOpenExport={() => setIsExportOpen(true)}
                />
              </div>
            )}

            {/* Tab 2: Sales by Device */}
            {activeTab === 'devices' && (
              <SalesDeviceAnalytics
                products={products}
                trafficData={trafficData}
                selectedDeviceFilter={selectedDeviceFilter}
                setSelectedDeviceFilter={setSelectedDeviceFilter}
                selectedCategoryFilter={selectedCategoryFilter}
                setSelectedCategoryFilter={setSelectedCategoryFilter}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}

            {/* Tab 3: Stock Predictions & Alerts */}
            {activeTab === 'stock' && (
              <StockPredictionView
                products={products}
                alerts={alerts}
                forecastData={forecastSeries}
                onTriggerReorder={handleTriggerReorder}
                onExecuteAlert={handleExecuteAlert}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}

            {/* Tab 4: Supplier POs */}
            {activeTab === 'suppliers' && (
              <SupplierOrdersView
                purchaseOrders={purchaseOrders}
                products={products}
                onUpdatePoStatus={handleUpdatePoStatus}
                onCreateNewPo={handleCreateNewPo}
              />
            )}

            {/* Tab 5: Reviews NLP & Return Risk */}
            {activeTab === 'reviews' && (
              <CustomerReviewsView
                reviews={reviews}
                products={products}
                onAddReview={handleAddReview}
                onRunAiAnalysis={handleRunAiAnalysis}
                aiAnalysis={aiAnalysis}
                isAnalyzing={isAnalyzingReviews}
              />
            )}

            {/* Tab 6: What-If Simulator */}
            {activeTab === 'whatif' && (
              <WhatIfSimulator products={products} trafficData={trafficData} />
            )}

            {/* Tab 7: AI Analysis Chat */}
            {activeTab === 'analysis-chat' && (
              <AnalysisChatView
                products={products}
                trafficData={trafficData}
                reviews={reviews}
                purchaseOrders={purchaseOrders}
                alerts={alerts}
                forecastSeries={forecastSeries}
                onNotify={showToast}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}

            {/* Tab 8: Settings & System Diagnostics */}
            {activeTab === 'settings' && (
              <SystemDiagnostics onNotify={showToast} />
            )}
          </div>
        )}
      </main>

      {/* Floating Chat Window Launcher Button (Persistent across all dashboard tabs & mobile simulator) */}
      <button
        type="button"
        id="btn-floating-chat-launcher"
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center space-x-2.5 px-4 py-3 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all border border-slate-700 cursor-pointer group"
        title="Ouvrir la fenêtre de chat d'analyse IA"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-xs font-bold tracking-tight text-white pr-1">
          Chat d'Analyse IA
        </span>
      </button>

      {/* AI Sales Copilot Assistant Modal Window */}
      <SalesCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        products={products}
        trafficData={trafficData}
        onNavigateToFullChat={() => {
          setIsCopilotOpen(false);
          setActiveTab('analysis-chat');
        }}
      />

      {/* Daily Results Spreadsheet Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        products={products}
        trafficData={trafficData}
        forecastSeries={forecastSeries}
        onNotify={showToast}
      />

      {/* CSV Catalogue & Sales Import Modal */}
      <CsvImportModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onImportProducts={(imported) => {
          setProducts(imported);
          showToast(`${imported.length} produits importés et actualisés avec succès !`);
        }}
        onNotify={showToast}
      />

      {/* New User Welcome & Onboarding Guide Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        userRole={userRole}
        onClose={() => setIsWelcomeOpen(false)}
        onOpenChat={() => {
          setIsWelcomeOpen(false);
          setIsCopilotOpen(true);
        }}
        onOpenImportCsv={() => {
          setIsWelcomeOpen(false);
          if (userRole !== 'partner') {
            setIsImportCsvOpen(true);
          }
        }}
        onOpenExport={() => {
          setIsWelcomeOpen(false);
          setIsExportOpen(true);
        }}
      />
    </div>
  );
}
