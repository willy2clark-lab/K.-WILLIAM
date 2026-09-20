import React, { useState } from 'react';
import { PurchaseOrder, Product } from '../types';
import { ShoppingCart, CheckCircle, Send, AlertTriangle, Sparkles, Plus, Clock, FileText, Check } from 'lucide-react';

interface SupplierOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onUpdatePoStatus: (poId: string, status: 'validated' | 'sent') => void;
  onCreateNewPo: (newPo: PurchaseOrder) => void;
}

export const SupplierOrdersView: React.FC<SupplierOrdersViewProps> = ({
  purchaseOrders,
  products,
  onUpdatePoStatus,
  onCreateNewPo,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(products[0].supplier);
  const [selectedProduct, setSelectedProduct] = useState(products[0].id);
  const [orderQuantity, setOrderQuantity] = useState(100);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProduct) || products[0];
    const total = orderQuantity * prod.supplierUnitCost;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `BC-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierName: prod.supplier,
      date: new Date().toISOString().split('T')[0],
      urgent: false,
      status: 'draft',
      aiRationale: `Commande manuelle générée pour réapprovisionnement de sécurité sur ${prod.name} (${orderQuantity} unités).`,
      totalAmount: total,
      estimatedDeliveryDate: new Date(Date.now() + prod.leadTimeDays * 86400000).toISOString().split('T')[0],
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: orderQuantity,
          unitCost: prod.supplierUnitCost,
          totalCost: total,
          currentStock: prod.currentStock,
          predictedDaysRemaining: Number((prod.currentStock / prod.dailyVelocity).toFixed(1)),
        },
      ],
    };

    onCreateNewPo(newPo);
    setShowCreateModal(false);
  };

  const fmt = (val: number) =>
    val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Header with New PO button */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Gestion des Commandes Fournisseurs & Bons d'Achat (PO)
          </h2>
          <p className="text-xs text-slate-500">
            L'IA prépare automatiquement les quantités exactes pour éviter le sur-stockage et absorber les délais de fabrication
          </p>
        </div>

        <button
          id="btn-open-create-po-modal"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-emerald-400" />
          Nouveau Bon de Commande
        </button>
      </div>

      {/* List of Purchase Orders */}
      <div className="space-y-4">
        {purchaseOrders.map((po) => {
          const isDraft = po.status === 'draft';
          const isValidated = po.status === 'validated';
          const isSent = po.status === 'sent';

          return (
            <div
              key={po.id}
              className={`bg-white rounded-xl p-5 border transition-all ${
                po.urgent && isDraft
                  ? 'border-amber-300 ring-1 ring-amber-200 shadow-xs'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">{po.poNumber}</span>
                      <span className="text-xs font-semibold text-slate-600">• {po.supplierName}</span>
                      {po.urgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase tracking-wider">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Date d'émission : {po.date} • Livraison estimée : {po.estimatedDeliveryDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isSent
                        ? 'bg-blue-100 text-blue-800'
                        : isValidated
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isSent ? 'Envoyé au fournisseur' : isValidated ? 'Validé en interne' : 'Brouillon IA'}
                  </span>
                </div>
              </div>

              {/* AI Rationale banner */}
              <div className="my-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start space-x-2 text-xs text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Justification IA Directeur des Ventes :</strong> {po.aiRationale}
                </div>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs mb-3">
                  <thead className="text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2">Article</th>
                      <th className="py-2 text-right">Stock Actuel</th>
                      <th className="py-2 text-right">Autonomie</th>
                      <th className="py-2 text-right">Quantité Suggérée</th>
                      <th className="py-2 text-right">Coût Unitaire HT</th>
                      <th className="py-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {po.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-bold text-slate-900">{item.productName}</td>
                        <td className="py-2 text-right text-slate-600">{item.currentStock} u.</td>
                        <td className="py-2 text-right text-amber-600 font-bold">{item.predictedDaysRemaining} j</td>
                        <td className="py-2 text-right font-extrabold text-slate-900">{item.quantity} u.</td>
                        <td className="py-2 text-right text-slate-600">{fmt(item.unitCost)}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{fmt(item.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Montant engagé : <strong className="text-base text-slate-900 font-black">{fmt(po.totalAmount)}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  {isDraft && (
                    <button
                      id={`btn-validate-po-${po.id}`}
                      onClick={() => onUpdatePoStatus(po.id, 'validated')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Valider le Bon de Commande
                    </button>
                  )}

                  {isValidated && (
                    <button
                      id={`btn-send-po-${po.id}`}
                      onClick={() => onUpdatePoStatus(po.id, 'sent')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs flex items-center"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Transmettre au Fournisseur par Email
                    </button>
                  )}

                  {isSent && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Commande confirmée chez le fabricant
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for creating a new PO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Créer un Bon de Commande Fournisseur
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sélectionnez l'article à réapprovisionner et ajustez la quantité
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock} u. • {p.supplier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité à commander</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Fournisseur associé :</span>
                  <span className="font-semibold text-slate-800">
                    {products.find((p) => p.id === selectedProduct)?.supplier}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Délai de livraison :</span>
                  <span className="font-semibold text-slate-800">
                    {products.find((p) => p.id === selectedProduct)?.leadTimeDays} jours
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Montant HT estimé :</span>
                  <span>
                    {fmt(orderQuantity * (products.find((p) => p.id === selectedProduct)?.supplierUnitCost || 0))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                >
                  Enregistrer le Bon de Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
