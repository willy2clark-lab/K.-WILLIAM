import React, { useState } from 'react';
import { Product, StockAlert, ForecastDataPoint } from '../types';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  AlertTriangle, 
  PackageCheck, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle,
  Truck,
  FileSpreadsheet
} from 'lucide-react';

interface StockPredictionViewProps {
  products: Product[];
  alerts: StockAlert[];
  forecastData: ForecastDataPoint[];
  onTriggerReorder: (productId: string) => void;
  onExecuteAlert: (alertId: string) => void;
  onOpenExport?: () => void;
}

export const StockPredictionView: React.FC<StockPredictionViewProps> = ({
  products,
  alerts,
  forecastData,
  onTriggerReorder,
  onExecuteAlert,
  onOpenExport,
}) => {
  const [selectedProductForForecast, setSelectedProductForForecast] = useState<string>('prod-cargo');

  const activeProduct = products.find((p) => p.id === selectedProductForForecast) || products[0];

  return (
    <div className="space-y-6">
      {/* Critical Stock Alerts Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alertes Stocks & Arbitrages IA Prioritaires
              </h2>
              <p className="text-xs text-slate-500">
                L'IA surveille la vitesse de vente, le délai fournisseur et le taux de retour par canal
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
            {alerts.filter((a) => !a.executed).length} alertes actives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.executed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                  : 'bg-blue-50/70 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-xs font-semibold text-slate-700">{alert.productName}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2">{alert.title}</h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-3">{alert.description}</p>

              {alert.deviceCorrelation && (
                <div className="mt-2 text-[11px] font-medium text-slate-700 bg-white/80 p-2 rounded border border-slate-200/60">
                  📱 <strong>Impact Device :</strong> {alert.deviceCorrelation}
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  id={`btn-alert-action-${alert.id}`}
                  onClick={() => onExecuteAlert(alert.id)}
                  disabled={alert.executed}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    alert.executed
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {alert.executed ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Action Effectuée
                    </>
                  ) : (
                    <>
                      {alert.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Health Table with Days-Of-Supply */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              État des Niveaux de Stock & Délais Fournisseurs
            </h3>
            <p className="text-xs text-slate-500">
              Calcul en temps réel de l'autonomie en jours (Stock / Vélocité journalière)
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Délai fournisseur moyen : <strong>12.4 jours</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Article</th>
                <th className="py-2.5 px-3">Fournisseur</th>
                <th className="py-2.5 px-3 text-right">Stock Actuel</th>
                <th className="py-2.5 px-3 text-right">Vitesse (u/j)</th>
                <th className="py-2.5 px-3 text-right">Autonomie (Jours)</th>
                <th className="py-2.5 px-3 text-right">Délai Fournisseur</th>
                <th className="py-2.5 px-3 text-right">Taux de Retour</th>
                <th className="py-2.5 px-3 text-right">Risque Qualité IA</th>
                <th className="py-2.5 px-3 text-center">Action Recommandée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((prod) => {
                const daysRemaining = (prod.currentStock / prod.dailyVelocity).toFixed(1);
                const isStockoutRisk = Number(daysRemaining) <= prod.leadTimeDays;
                const isCritical = Number(daysRemaining) < 5;

                return (
                  <tr 
                    key={prod.id} 
                    onClick={() => setSelectedProductForForecast(prod.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedProductForForecast === prod.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900">{prod.name}</span>
                      <span className="block text-[11px] text-slate-500">{prod.category}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{prod.supplier}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${prod.currentStock <= prod.minStockThreshold ? 'text-rose-600' : 'text-slate-900'}`}>
                        {prod.currentStock} u.
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{prod.dailyVelocity} u/j</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-extrabold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isStockoutRisk
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {daysRemaining} j
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 flex-items-center">
                      <span className="inline-flex items-center">
                        <Truck className="w-3 h-3 mr-1 text-slate-400" />
                        {prod.leadTimeDays} jours
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${prod.returnRate >= 0.3 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {(prod.returnRate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prod.qualityRiskScore > 70
                                ? 'bg-rose-500'
                                : prod.qualityRiskScore > 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${prod.qualityRiskScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold">{prod.qualityRiskScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {prod.reorderQuantitySuggested > 0 ? (
                        <button
                          id={`btn-reorder-${prod.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerReorder(prod.id);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-2xs"
                        >
                          PO Suggéré ({prod.reorderQuantitySuggested} u.)
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">Stock suffisant</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Forecast Chart (Historical vs AI Predicted Time Series) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Prévision de Ventes & Trajectoire de Stock à 14 Jours
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                Modèle Time-Series IA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Focus article : <strong className="text-slate-900">{activeProduct.name}</strong> (Vélocité: {activeProduct.dailyVelocity} u/jour • Stock: {activeProduct.currentStock} u.)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Changer d'article :</span>
              <select
                id="select-forecast-product"
                value={selectedProductForForecast}
                onChange={(e) => setSelectedProductForForecast(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {onOpenExport && (
              <button
                id="btn-forecast-export-spreadsheet"
                onClick={onOpenExport}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                title="Exporter les résultats prédictifs journaliers vers un tableur"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Exporter Tableur</span>
              </button>
            )}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  `${val} unités`,
                  name === 'historicalSales'
                    ? 'Ventes Réalisées'
                    : name === 'predictedSales'
                    ? 'Ventes Prédites (IA)'
                    : 'Niveau de Stock Projeté',
                ]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {/* Historical sales curve */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="historicalSales"
                name="Ventes Réalisées"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              {/* Predicted sales curve */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="predictedSales"
                name="Ventes Prédites (IA)"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, stroke: '#6366f1', fill: '#fff' }}
              />
              {/* Projected stock depletion */}
              <Line
                yAxisId="right"
                type="stepAfter"
                dataKey="stockLevel"
                name="Stock Restant (Projeté)"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
          <span>
            <strong>Rupture de Stock Calculée :</strong> Épuisement projeté au <strong>24 Septembre</strong> sans réassort. Compte tenu du délai de 14 jours, le bon de commande doit être validé aujourd'hui.
          </span>
          <button
            id="btn-trigger-order-quick"
            onClick={() => onTriggerReorder(activeProduct.id)}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 shrink-0 ml-4 shadow-xs"
          >
            Générer le Bon de Commande
          </button>
        </div>
      </div>
    </div>
  );
};
