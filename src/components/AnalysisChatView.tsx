import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  Smartphone,
  PackageCheck,
  ShoppingBag,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  HelpCircle,
  Zap,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Maximize2,
  Minimize2,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { 
  Product, 
  TrafficChannelData, 
  CustomerReview, 
  PurchaseOrder, 
  StockAlert, 
  ForecastDataPoint 
} from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

interface AnalysisChatViewProps {
  products: Product[];
  trafficData: TrafficChannelData[];
  reviews: CustomerReview[];
  purchaseOrders: PurchaseOrder[];
  alerts: StockAlert[];
  forecastSeries: ForecastDataPoint[];
  onNotify?: (message: string) => void;
  onOpenExport?: () => void;
}

export const AnalysisChatView: React.FC<AnalysisChatViewProps> = ({
  products,
  trafficData,
  reviews,
  purchaseOrders,
  alerts,
  forecastSeries,
  onNotify,
  onOpenExport,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### 👋 Bonjour Monsieur le Directeur des Ventes

Je suis votre **Copilote & Analyste IA**, connecté en direct à l'ensemble de votre écosystème commercial :
- **6 Références Produits** (avec leurs marges brutes, vélocités et coûts de retours réels)
- **Trafic & Conversion par Support** (Mobile vs Tablette vs Desktop)
- **Avis Clients & NLP Retours** (détection des anomalies de tailles et coupes)
- **Stocks & Prédictions J+30** (gestion des risques de rupture et délais fournisseurs)

Posez-moi n'importe quelle question stratégique ou cliquez sur l'un des prompts d'analyse rapide ci-dessous pour lancer une analyse comparative.`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Quel est le plan de réassort prioritaire pour les 15 prochains jours ?',
        'Pourquoi le panier moyen Desktop (91$) surpasse-t-il le Mobile (72$) ?',
        'Faut-il commander le Baggy Cargo aujourd’hui malgré les 36% de retours ?',
        'Quels bons de commande fournisseurs puis-je valider en toute sécurité ?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Quick preset prompts organized by sales decision themes
  const promptCategories = [
    {
      title: 'Performance & Marges',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      prompt: 'Quel produit détruit le plus de marge nette après déduction des frais de retours ?',
    },
    {
      title: 'Mobile vs Desktop',
      icon: Smartphone,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      prompt: 'Pourquoi le taux de conversion chute-t-il sur Mobile (2.4%) par rapport au Desktop (3.5%) ?',
    },
    {
      title: 'Risques Ruptures J+30',
      icon: PackageCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      prompt: 'Quels articles risquent la rupture de stock sous 10 jours et quel est le délai fournisseur ?',
    },
    {
      title: 'Achats Fournisseurs',
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      prompt: 'Quels bons de commande fournisseurs dois-je valider en priorité ce matin ?',
    },
    {
      title: 'Retours & Qualité',
      icon: RotateCcw,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      prompt: 'Analyse la corrélation entre achats sur smartphone et retours massifs du Baggy Cargo Vintage.',
    },
  ];

  // Global KPIs for context
  const totalRevenue = products.reduce((acc, p) => acc + p.grossRevenue, 0);
  const totalNetRevenue = products.reduce((acc, p) => acc + p.netRevenue, 0);
  const avgReturnRate = (products.reduce((acc, p) => acc + p.returnRate, 0) / products.length) * 100;
  const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Build conversation history excluding initial welcome for compact prompt
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome-1')
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const contextPayload = {
        productsSummary: products.map((p) => ({
          nom: p.name,
          categorie: p.category,
          ventes: p.orders,
          caBrut: p.grossRevenue,
          caNet: p.netRevenue,
          tauxRetourGlobal: `${(p.returnRate * 100).toFixed(0)}%`,
          tauxRetourMobile: `${(p.mobileReturnRate * 100).toFixed(0)}%`,
          tauxRetourDesktop: `${(p.desktopReturnRate * 100).toFixed(0)}%`,
          coutTotalRetours: p.totalReturnCost,
          stockActuel: p.currentStock,
          delaiFournisseurJours: p.leadTimeDays,
          fournisseur: p.supplier,
          reassortSuggere: p.reorderQuantitySuggested,
        })),
        trafficPerformance: trafficData.map((t) => ({
          device: t.deviceCategory,
          canal: t.channelGroup,
          sessions: t.sessions,
          conversions: t.transactions,
          tauxConversion: `${(t.conversionRate * 100).toFixed(2)}%`,
          panierMoyenAOV: `${t.aov.toFixed(1)}$`,
          caTotal: t.purchaseRevenue,
        })),
        pendingPOs: purchaseOrders.map((po) => ({
          poNumber: po.poNumber,
          fournisseur: po.supplierName,
          statut: po.status,
          urgent: po.urgent,
          montantTotal: `${po.totalAmount} $`,
          rationale: po.aiRationale,
        })),
        activeAlerts: alerts.map((a) => ({
          produit: a.productName,
          gravite: a.severity,
          titre: a.title,
          description: a.description,
        })),
      };

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          context: contextPayload,
          history: conversationHistory,
        }),
      });

      const data = await res.json();

      if (data.answer) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: data.suggestedFollowUps || [
            'Quelle action concrète mettre en place sur le site mobile ?',
            'Quel est le plan de trésorerie pour les commandes fournisseurs ?',
          ],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Aucune réponse reçue du serveur.');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Erreur lors de l'analyse** : ${err.message || "Impossible de joindre le copilote IA."}\n\nVérifiez votre connexion au serveur ou lancez un diagnostic dans l'onglet Paramètres.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
      if (onNotify) {
        onNotify('Analyse copiée dans le presse-papier !');
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Voulez-vous réinitialiser l\'historique du chat d\'analyse ?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: `### 🔄 Session d'Analyse Réinitialisée\n\nL'historique a été purgé. Les données temps réel de vos ventes, stocks et canaux sont prêtes pour une nouvelle question stratégique.`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: [
            'Quel est le produit le plus rentable après déduction des retours ?',
            'Pourquoi le panier moyen Desktop surpasse-t-il le Mobile ?',
            'Quels articles risquent une rupture de stock sous 10 jours ?',
          ],
        },
      ]);
      if (onNotify) {
        onNotify('Historique du chat réinitialisé.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple Markdown renderer with clean formatting
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-900 mt-2 mb-1 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-emerald-500 inline shrink-0" />
                <span>{trimmed.replace('### ', '')}</span>
              </h3>
            );
          }

          // Heading 2 or 1
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h4 key={idx} className="text-sm font-extrabold text-slate-900 mt-3 mb-1">
                {trimmed.replace(/^#+ /, '')}
              </h4>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rawText = trimmed.replace(/^[-*] /, '');
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1">
                <span className="text-emerald-500 font-bold mt-1 text-xs">•</span>
                <span className="flex-1 text-slate-700" dangerouslySetInnerHTML={{ __html: formatInline(rawText) }} />
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+/)?.[0];
            const rawText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 mt-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  {num}
                </span>
                <span className="flex-1 text-slate-800" dangerouslySetInnerHTML={{ __html: formatInline(rawText) }} />
              </div>
            );
          }

          // Standard paragraph
          return (
            <p key={idx} className="text-slate-800" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Code / tag: `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="font-mono text-[11px] bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded border border-slate-200">$1</code>');
    return formatted;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-fade-in" id="analysis-chat-view">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquareText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Chat d'Analyse Commerciale & Stocks IA
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dialogue interactif avec votre copilote pour l'aide à la décision : arbitrages achats, marges nettes, analyse des retours et ratios par support.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
            title="Effacer la conversation"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
            title={isSidebarOpen ? 'Masquer la synthèse des données' : 'Afficher la synthèse des données'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'Masquer Snapshot' : 'Afficher Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout: Left Stream + Optional Right Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Chat Column (8 cols when sidebar open, 12 when collapsed) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs h-[720px] transition-all`}>
          {/* Quick Prompts Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl overflow-x-auto scrollbar-none flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Suggestions :
            </span>
            {promptCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(cat.prompt)}
                  disabled={isLoading}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-900 transition-all whitespace-nowrap shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const isCopied = copiedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isAssistant ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold ${
                      isAssistant
                        ? 'bg-slate-900 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center space-x-2 mb-1 px-1 text-[11px] text-slate-400">
                      <span className="font-semibold">{isAssistant ? 'Copilote Stratégique' : 'Vous'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm shadow-2xs relative group ${
                        isAssistant
                          ? 'bg-slate-50/90 border border-slate-200/80 text-slate-900 rounded-tl-sm'
                          : 'bg-slate-900 text-white rounded-tr-sm'
                      }`}
                    >
                      {isAssistant ? (
                        <>
                          {renderFormattedContent(msg.content)}

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-2xs cursor-pointer"
                            title="Copier la réponse"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>

                    {/* Follow-up suggestions */}
                    {isAssistant && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-2.5 pl-1 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendMessage(suggestion)}
                            disabled={isLoading}
                            className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-colors text-left cursor-pointer disabled:opacity-50"
                          >
                            <ArrowRight className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Analysis Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-3 shadow-2xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <div>
                    <span className="font-semibold text-slate-800 block">L'IA analyse les données...</span>
                    <span className="text-[11px] text-slate-400">Croisement des 6 références, ratios de retours et flux par support</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all p-2">
              <textarea
                ref={textareaRef}
                id="input-chat-query"
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez une question au copilote (ex : 'Faut-il commander le Baggy Cargo ?', 'Pourquoi le mobile sous-performe ?')..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden resize-none max-h-32 px-1"
                disabled={isLoading}
              />

              <div className="flex items-center space-x-2 shrink-0 ml-2">
                <button
                  type="button"
                  id="btn-send-chat-message"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputQuery.trim()}
                  className="p-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  title="Envoyer (Entrée)"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1 text-emerald-500" />
                <span>Appuyez sur <strong>Entrée</strong> pour envoyer, <strong>Maj + Entrée</strong> pour aller à la ligne</span>
              </span>
              <span className="hidden sm:inline font-mono">Modèle Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data Snapshot */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 space-y-4 animate-fade-in" id="chat-live-data-snapshot">
            {/* Live Metrics Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Instantané des Données
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  En Direct
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CA Brut Total</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {totalRevenue.toLocaleString('fr-FR')} $
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Net : {totalNetRevenue.toLocaleString('fr-FR')} $
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Taux Retour Moyen</span>
                  <span className="text-sm font-black text-rose-600 font-mono">
                    {avgReturnRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-rose-500 block">
                    -28 230 $ de marge
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Physique</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {totalStock} unités
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Sur 6 références
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Alertes Critiques</span>
                  <span className="text-sm font-black text-amber-600 font-mono">
                    {criticalAlertsCount} prioritaires
                  </span>
                  <span className="text-[10px] text-amber-600 block">
                    Stock & Retours
                  </span>
                </div>
              </div>
            </div>

            {/* Top Critical Action Alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center mb-3">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                Sujets à Arbitrer dans le Chat
              </span>

              <div className="space-y-2.5">
                <div
                  onClick={() => handleSendMessage("Comment traiter le Baggy Cargo Vintage qui a 36% de retour et 48 unités en stock ?")}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                    <span>1. Baggy Cargo Vintage</span>
                    <span className="text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-950 font-mono">
                      36% retours
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-1">
                    48 unités restantes, 14j délai fournisseur. Faut-il limiter la commande à 150 unités ?
                  </p>
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 mt-2 group-hover:underline">
                    <span>Poser cette question</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>

                <div
                  onClick={() => handleSendMessage("Faut-il valider immédiatement le bon de commande du Wool Dress Trousers Sartorial (28 unités en stock) ?")}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>2. Wool Dress Trousers</span>
                    <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 font-mono">
                      Stock 28 u.
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Rupture imminente dans 8 jours, délai de 18 jours chez Tessitura Biella.
                  </p>
                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 mt-2 group-hover:underline">
                    <span>Poser cette question</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>

                <div
                  onClick={() => handleSendMessage("Comment exploiter le taux de conversion élevé sur Desktop (3.5% vs 2.4% mobile) ?")}
                  className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>3. Arbitrage Paid Desktop</span>
                    <span className="text-[10px] bg-blue-200/80 px-1.5 py-0.5 rounded text-blue-950 font-mono">
                      AOV 91 $
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Panier moyen 19 $ plus élevé sur Desktop. Réallocation recommandée de 20% du budget acquisition.
                  </p>
                  <span className="inline-flex items-center text-[10px] font-bold text-blue-700 mt-2 group-hover:underline">
                    <span>Poser cette question</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Export Hint */}
            {onOpenExport && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-bold block text-white">Besoin d'un tableur complet ?</span>
                  <span className="text-[11px] text-slate-300">Générez l'export .CSV & expédition e-mail</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenExport}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shrink-0 cursor-pointer"
                >
                  Export Tableur
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
