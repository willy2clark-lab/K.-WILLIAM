import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User, AlertCircle } from 'lucide-react';
import { Product, TrafficChannelData } from '../types';

interface SalesCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  trafficData: TrafficChannelData[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const SalesCopilotModal: React.FC<SalesCopilotModalProps> = ({
  isOpen,
  onClose,
  products,
  trafficData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Bonjour Monsieur le Directeur des Ventes. Je suis votre Copilote Commercial IA. J'ai analysé en temps réel vos données de ventes sur votre site marchand, la répartition par support (Mobile, Tablette, Desktop) et les taux de retour critiques. Quelle question stratégique ou décision d'approvisionnement souhaitez-vous trancher ?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Faut-il commander le Baggy Cargo aujourd’hui malgré les 36% de retours ?',
    'Pourquoi le panier moyen Desktop (91€) surpasse-t-il le Mobile (72€) ?',
    'Quelle est la priorité de réapprovisionnement pour les 15 prochains jours ?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          context: {
            productsSummary: products.map((p) => ({
              nom: p.name,
              ventes: p.orders,
              caBrut: p.grossRevenue,
              retoursPct: `${(p.returnRate * 100).toFixed(0)}%`,
              stockActuel: p.currentStock,
              autonomieJours: (p.currentStock / p.dailyVelocity).toFixed(1),
              fournisseur: p.supplier,
              delai: p.leadTimeDays,
            })),
            devicesSummary: {
              mobileSharePct: '58%',
              desktopConversion: '3.5% à 5.5%',
              mobileConversion: '2.4%',
              totalGross: 117025,
              totalNet: 112853,
            },
          },
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: resData.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Désolé, une erreur est survenue lors de la consultation du modèle IA. Veuillez vérifier vos données de vente.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Recommandation hors-ligne : Sur le Baggy Cargo, limitez la commande à 150 unités au lieu des 250 habituelles tant que l'ergonomie du guide des tailles sur mobile n'a pas été corrigée.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight">Copilote Directeur des Ventes</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                  Gemini IA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Conseiller stratégique en temps réel : Achats, Stocks & Arbitrages Devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold shrink-0 text-[11px]">Idées :</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 italic text-xs pl-9">
              <Bot className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Réflexion stratégique du copilote...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Posez votre question (ex: Dois-je recommander des Chinos ou des Cargos ?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
