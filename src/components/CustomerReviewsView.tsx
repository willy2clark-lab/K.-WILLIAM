import React, { useState } from 'react';
import { CustomerReview, Product, AIAnalysisResult, DeviceCategory } from '../types';
import { 
  Star, 
  RotateCcw, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Bot, 
  ArrowUpRight 
} from 'lucide-react';

interface CustomerReviewsViewProps {
  reviews: CustomerReview[];
  products: Product[];
  onAddReview: (review: CustomerReview) => void;
  onRunAiAnalysis: () => Promise<AIAnalysisResult | null>;
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
}

export const CustomerReviewsView: React.FC<CustomerReviewsViewProps> = ({
  reviews,
  products,
  onAddReview,
  onRunAiAnalysis,
  aiAnalysis,
  isAnalyzing,
}) => {
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'all' | DeviceCategory>('all');
  const [filterReturnedOnly, setFilterReturnedOnly] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New review form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newProduct, setNewProduct] = useState(products[0].id);
  const [newRating, setNewRating] = useState(3);
  const [newDevice, setNewDevice] = useState<DeviceCategory>('mobile');
  const [newText, setNewText] = useState('');
  const [newReturned, setNewReturned] = useState(false);
  const [newReturnReason, setNewReturnReason] = useState('');

  const filteredReviews = reviews.filter((rev) => {
    if (selectedProductFilter !== 'all' && rev.productId !== selectedProductFilter) return false;
    if (selectedDeviceFilter !== 'all' && rev.deviceCategory !== selectedDeviceFilter) return false;
    if (filterReturnedOnly && !rev.returned) return false;
    return true;
  });

  // Calculate return stats
  const totalReviewsCount = reviews.length;
  const returnedReviewsCount = reviews.filter((r) => r.returned).length;
  const mobileReviews = reviews.filter((r) => r.deviceCategory === 'mobile');
  const mobileReturnRateFromReviews = mobileReviews.length > 0 
    ? (mobileReviews.filter((r) => r.returned).length / mobileReviews.length) * 100 
    : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === newProduct) || products[0];

    // Simple heuristic sentiment
    const sentiment = newRating >= 4 ? 'positive' : newRating === 3 ? 'neutral' : 'negative';

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      author: newAuthor || 'Client Vérifié',
      date: new Date().toISOString().split('T')[0],
      rating: newRating,
      deviceCategory: newDevice,
      text: newText,
      returned: newReturned,
      returnReason: newReturned ? (newReturnReason || 'Motif non précisé') : undefined,
      sentiment,
      extractedIssues: newReturned ? [newReturnReason || 'Retour signalé'] : ['Avis positif'],
    };

    onAddReview(newRev);
    setShowAddModal(false);
    setNewText('');
    setNewReturnReason('');
    setNewReturned(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Analysis Trigger */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Intelligence Artificielle NLP (Gemini)
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Analyse Sémantique des Avis & Détection Prédictive des Retours
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              L'IA croise le texte des avis avec les supports d'achat (Mobile vs Desktop) pour isoler les défauts récurrents avant qu'ils ne se transforment en perte de trésorerie.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-run-ai-review-analysis"
              onClick={onRunAiAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <Bot className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-bounce' : ''}`} />
              {isAnalyzing ? 'Analyse Gemini en cours...' : 'Lancer l\'Analyse IA Complète'}
            </button>
            <button
              id="btn-open-add-review-modal"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Ajouter un Avis Test
            </button>
          </div>
        </div>

        {/* Dynamic AI Analysis Result Block */}
        {aiAnalysis && (
          <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-3">
            <div className="flex items-start justify-between">
              <span className="font-extrabold text-emerald-400 text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Synthèse Stratégique IA
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                Économie potentielle : +{aiAnalysis.predictedReturnReductionOpportunity} €/mois
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed">{aiAnalysis.executiveSummary}</p>

            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{aiAnalysis.primaryAlert}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {aiAnalysis.keyIssues.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-xs">{issue.issue}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                      {issue.deviceSpecific}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">Produit : {issue.impactedProduct}</p>
                  <p className="text-[11px] text-emerald-300">💡 {issue.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avis Compilés</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalReviewsCount}</span>
            <span className="text-xs font-semibold text-slate-600">Note moy. 3.6 / 5</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Extraits du flux marchand direct</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux de Retour Déclaré</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">
              {((returnedReviewsCount / totalReviewsCount) * 100).toFixed(0)}%
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
              {returnedReviewsCount} retours
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sur les avis clients déposés</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Corrélation Mobile</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">
              {mobileReturnRateFromReviews.toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              vs Desktop: {(reviews.filter(r => r.deviceCategory === 'desktop' && r.returned).length / Math.max(1, reviews.filter(r => r.deviceCategory === 'desktop').length) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Problème accru d'ergonomie mobile</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Produit :</span>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="all">Tous les articles</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-700">Support :</span>
            <select
              value={selectedDeviceFilter}
              onChange={(e) => setSelectedDeviceFilter(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="all">Tous les supports</option>
              <option value="mobile">Mobile uniquement</option>
              <option value="desktop">Desktop uniquement</option>
              <option value="tablet">Tablette uniquement</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterReturnedOnly}
              onChange={(e) => setFilterReturnedOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Articles retournés uniquement</span>
          </label>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredReviews.length} avis affichés
        </span>
      </div>

      {/* Reviews Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => {
          const isReturned = rev.returned;
          return (
            <div
              key={rev.id}
              className={`p-4 rounded-xl border bg-white shadow-xs transition-all ${
                isReturned ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{rev.author}</span>
                    <span className="text-[11px] text-slate-400">• {rev.date}</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        rev.deviceCategory === 'mobile'
                          ? 'bg-indigo-50 text-indigo-700'
                          : rev.deviceCategory === 'desktop'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rev.deviceCategory === 'mobile' ? (
                        <Smartphone className="w-3 h-3 mr-1" />
                      ) : rev.deviceCategory === 'desktop' ? (
                        <Monitor className="w-3 h-3 mr-1" />
                      ) : (
                        <Tablet className="w-3 h-3 mr-1" />
                      )}
                      {rev.deviceCategory}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                    {rev.productName}
                  </span>
                </div>

                <div className="flex items-center space-x-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                "{rev.text}"
              </p>

              {/* Return cause tag */}
              {isReturned && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                  <span className="flex items-center">
                    <RotateCcw className="w-3 h-3 mr-1 text-rose-600" />
                    Retour : {rev.returnReason}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-200/60 text-rose-900">
                    Alerte Qualité
                  </span>
                </div>
              )}

              {/* Extracted issues keywords */}
              {rev.extractedIssues && rev.extractedIssues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {rev.extractedIssues.map((issue, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      # {issue}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Simuler l'Arrivée d'un Nouvel Avis Client
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Testez comment l'IA détecte immédiatement les nouveaux signaux faibles et motifs de retour
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article</label>
                <select
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Support Utilisé</label>
                  <select
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value as DeviceCategory)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                  >
                    <option value="mobile">Mobile (iPhone/Android)</option>
                    <option value="desktop">Desktop (Ordinateur)</option>
                    <option value="tablet">Tablette</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Note attribuée (1 à 5)</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                  >
                    <option value={5}>5 ★ - Excellent</option>
                    <option value={4}>4 ★ - Très bien</option>
                    <option value={3}>3 ★ - Moyen</option>
                    <option value={2}>2 ★ - Décevant</option>
                    <option value={1}>1 ★ - Inacceptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commentaire client</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex : Commande reçue rapidement mais sur smartphone le coloris beige ressemblait à du blanc cassé..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newReturned}
                    onChange={(e) => setNewReturned(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Ce client a demandé un retour / remboursement</span>
                </label>
              </div>

              {newReturned && (
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    Motif de retour signalé
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Taille trop étroite / guide illisible"
                    value={newReturnReason}
                    onChange={(e) => setNewReturnReason(e.target.value)}
                    className="w-full text-xs border border-rose-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                >
                  Publier l'Avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
