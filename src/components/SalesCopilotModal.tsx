import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  User, 
  Maximize2, 
  Copy, 
  Check, 
  RotateCcw, 
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Smartphone,
  PackageCheck,
  ShoppingBag
} from 'lucide-react';
import { Product, TrafficChannelData } from '../types';

interface SalesCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  trafficData: TrafficChannelData[];
  onNavigateToFullChat?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggestedFollowUps?: string[];
}

export const SalesCopilotModal: React.FC<SalesCopilotModalProps> = ({
  isOpen,
  onClose,
  products,
  trafficData,
  onNavigateToFullChat,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Bonjour Monsieur le Directeur des Ventes. Je suis votre Copilote Commercial IA.\n\nJ'ai analysé en direct vos 6 références produits, les volumes de trafic par support (Mobile, Tablette, Desktop) et les taux de retour critiques. Quelle question stratégique ou décision d'approvisionnement souhaitez-vous trancher ?",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Faut-il commander le Baggy Cargo aujourd’hui malgré les 36% de retours ?',
        'Pourquoi le panier moyen Desktop (91$) surpasse-t-il le Mobile (72$) ?',
        'Quelle est la priorité de réapprovisionnement pour les 15 prochains jours ?',
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Faut-il commander le Baggy Cargo aujourd’hui malgré les 36% de retours ?',
    'Pourquoi le panier moyen Desktop (91$) surpasse-t-il le Mobile (72$) ?',
    'Quelle est la priorité de réapprovisionnement pour les 15 prochains jours ?',
    'Quels bons de commande fournisseurs puis-je valider en sécurité ?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      })).concat({ role: 'user', content: query });

      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          history: conversationHistory,
          context: {
            productsSummary: products.map((p) => ({
              nom: p.name,
              categorie: p.category,
              ventes: p.orders,
              caBrut: p.grossRevenue,
              caNet: p.netRevenue,
              retoursPct: `${(p.returnRate * 100).toFixed(0)}%`,
              coutRetours: p.totalReturnCost,
              stockActuel: p.currentStock,
              delai: p.leadTimeDays,
              fournisseur: p.supplier,
              reassortSuggere: p.reorderQuantitySuggested,
            })),
            devicesSummary: trafficData.map((t) => ({
              support: t.deviceCategory,
              canal: t.channelGroup,
              sessions: t.sessions,
              tauxConversion: `${(t.conversionRate * 100).toFixed(2)}%`,
              panierMoyenAOV: `${t.aov.toFixed(1)}$`,
              caTotal: t.purchaseRevenue,
            })),
          },
        }),
      });

      const resData = await response.json();
      if (resData && resData.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: resData.answer,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUps: resData.suggestedFollowUps || [
              'Comment corriger le guide des tailles mobile ?',
              'Quel est l’impact financier si on réduit les retours de 15% ?',
            ],
          },
        ]);
      } else {
        throw new Error(resData?.error || 'Réponse invalide.');
      }
    } catch (err: any) {
      console.error('Advisor query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "⚠️ Recommandation de secours (mode local) : Sur le **Baggy Cargo**, plafonnez le réassort à 150 unités au lieu des 250 habituelles tant que l'ergonomie du guide des tailles sur mobile n'a pas été corrigée.",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Basic inline formatting for message text
  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={lIdx} className="h-1.5" />;

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const title = trimmed.replace(/^#+\s*/, '');
        return (
          <h4 key={lIdx} className="font-bold text-slate-900 text-xs sm:text-sm mt-2 mb-1 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500 inline" />
            <span>{title}</span>
          </h4>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bullet = trimmed.replace(/^[-*]\s*/, '');
        return (
          <div key={lIdx} className="flex items-start space-x-1.5 pl-1 my-0.5">
            <span className="text-emerald-500 font-bold">•</span>
            <span className="text-slate-700" dangerouslySetInnerHTML={{ __html: inlineStyles(bullet) }} />
          </div>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+/)?.[0];
        const rest = trimmed.replace(/^\d+\.\s*/, '');
        return (
          <div key={lIdx} className="flex items-start space-x-1.5 pl-1 my-1">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <span className="text-slate-800" dangerouslySetInnerHTML={{ __html: inlineStyles(rest) }} />
          </div>
        );
      }

      return (
        <p key={lIdx} className="my-0.5" dangerouslySetInnerHTML={{ __html: inlineStyles(trimmed) }} />
      );
    });
  };

  const inlineStyles = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="font-mono text-[10px] bg-slate-200/80 px-1 py-0.5 rounded text-indigo-800">$1</code>');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="sales-copilot-modal-backdrop"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] max-h-[680px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-scale-up"
        id="sales-copilot-modal-window"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white">
                  Fenêtre de Chat Commercial IA
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Conseiller stratégique en direct : Achats, Stocks & Arbitrages Devices
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onNavigateToFullChat && (
              <button
                type="button"
                onClick={onNavigateToFullChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Ouvrir dans l'onglet d'analyse plein écran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fermer la fenêtre de chat (Échap)"
              id="btn-close-copilot-modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick prompt suggestions carousel */}
        <div className="px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs shrink-0">
          <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase tracking-wider">
            Raccourcis :
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-colors shrink-0 text-[11px] cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Chat Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
          {messages.map((m, idx) => {
            const isAssistant = m.role === 'assistant';
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${
                  isAssistant ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                    isAssistant
                      ? 'bg-slate-900 text-emerald-400'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed relative group shadow-2xs ${
                      isAssistant
                        ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200'
                        : 'bg-slate-900 text-white rounded-tr-none'
                    }`}
                  >
                    {isAssistant ? (
                      <>
                        <div className="text-xs leading-relaxed text-slate-800">
                          {formatText(m.content)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(m.content, idx)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs"
                          title="Copier la réponse"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap text-xs sm:text-sm">{m.content}</p>
                    )}
                  </div>

                  {/* Follow-up suggestions */}
                  {isAssistant && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.suggestedFollowUps.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSendMessage(s)}
                          disabled={isLoading}
                          className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors text-left cursor-pointer disabled:opacity-50"
                        >
                          <ArrowRight className="w-2.5 h-2.5 mr-1 text-emerald-600 shrink-0" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2.5 text-slate-500 text-xs pl-9 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>L'IA analyse les 6 références, les retours et les données par device...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            id="modal-chat-input"
            placeholder="Posez votre question (ex: Dois-je commander le Baggy Cargo ?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium placeholder-slate-400"
          />
          <button
            type="button"
            id="btn-modal-chat-send"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            title="Envoyer le message"
          >
            <Send className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
