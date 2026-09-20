import React, { useState, useMemo } from 'react';
import { Product, TrafficChannelData, DeviceCategory } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { Smartphone, Monitor, Tablet, Filter, ArrowUpRight, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface SalesDeviceAnalyticsProps {
  products: Product[];
  trafficData: TrafficChannelData[];
  selectedDeviceFilter: 'all' | DeviceCategory;
  setSelectedDeviceFilter: (dev: 'all' | DeviceCategory) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  onOpenExport?: () => void;
}

export const SalesDeviceAnalytics: React.FC<SalesDeviceAnalyticsProps> = ({
  products,
  trafficData,
  selectedDeviceFilter,
  setSelectedDeviceFilter,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  onOpenExport,
}) => {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders' | 'returnRate'>('revenue');

  // Device Aggregation for Donut Chart
  const deviceTotals = useMemo(() => {
    const devices: Record<DeviceCategory, { sessions: number; revenue: number; transactions: number; addToCart: number }> = {
      mobile: { sessions: 0, revenue: 0, transactions: 0, addToCart: 0 },
      desktop: { sessions: 0, revenue: 0, transactions: 0, addToCart: 0 },
      tablet: { sessions: 0, revenue: 0, transactions: 0, addToCart: 0 },
    };

    trafficData.forEach((row) => {
      devices[row.deviceCategory].sessions += row.sessions;
      devices[row.deviceCategory].revenue += row.purchaseRevenue;
      devices[row.deviceCategory].transactions += row.transactions;
      devices[row.deviceCategory].addToCart += row.addToCart;
    });

    return [
      {
        name: 'Mobile',
        key: 'mobile',
        revenue: devices.mobile.revenue,
        sessions: devices.mobile.sessions,
        transactions: devices.mobile.transactions,
        aov: devices.mobile.transactions > 0 ? devices.mobile.revenue / devices.mobile.transactions : 0,
        conversion: devices.mobile.sessions > 0 ? (devices.mobile.transactions / devices.mobile.sessions) * 100 : 0,
        color: '#6366f1', // Indigo
      },
      {
        name: 'Desktop',
        key: 'desktop',
        revenue: devices.desktop.revenue,
        sessions: devices.desktop.sessions,
        transactions: devices.desktop.transactions,
        aov: devices.desktop.transactions > 0 ? devices.desktop.revenue / devices.desktop.transactions : 0,
        conversion: devices.desktop.sessions > 0 ? (devices.desktop.transactions / devices.desktop.sessions) * 100 : 0,
        color: '#10b981', // Emerald
      },
      {
        name: 'Tablette',
        key: 'tablet',
        revenue: devices.tablet.revenue,
        sessions: devices.tablet.sessions,
        transactions: devices.tablet.transactions,
        aov: devices.tablet.transactions > 0 ? devices.tablet.revenue / devices.tablet.transactions : 0,
        conversion: devices.tablet.sessions > 0 ? (devices.tablet.transactions / devices.tablet.sessions) * 100 : 0,
        color: '#f59e0b', // Amber
      },
    ];
  }, [trafficData]);

  // Product categories dynamic chart data based on selected device filter
  const productChartData = useMemo(() => {
    return products.map((prod) => {
      // Calculate adjusted numbers if device filter is applied
      let displayedRevenue = prod.grossRevenue;
      let displayedNet = prod.netRevenue;
      let returnRatePct = prod.returnRate * 100;

      if (selectedDeviceFilter === 'mobile') {
        displayedRevenue = Math.round(prod.grossRevenue * 0.48);
        returnRatePct = prod.mobileReturnRate * 100;
        displayedNet = Math.round(displayedRevenue * (1 - prod.mobileReturnRate));
      } else if (selectedDeviceFilter === 'desktop') {
        displayedRevenue = Math.round(prod.grossRevenue * 0.44);
        returnRatePct = prod.desktopReturnRate * 100;
        displayedNet = Math.round(displayedRevenue * (1 - prod.desktopReturnRate));
      } else if (selectedDeviceFilter === 'tablet') {
        displayedRevenue = Math.round(prod.grossRevenue * 0.08);
        returnRatePct = prod.tabletReturnRate * 100;
        displayedNet = Math.round(displayedRevenue * (1 - prod.tabletReturnRate));
      }

      return {
        name: prod.category,
        grossRevenue: displayedRevenue,
        netRevenue: displayedNet,
        returnCost: displayedRevenue - displayedNet,
        returnRate: Number(returnRatePct.toFixed(1)),
        orders: selectedDeviceFilter === 'all' 
          ? prod.orders 
          : selectedDeviceFilter === 'mobile' 
          ? Math.round(prod.orders * 0.52) 
          : selectedDeviceFilter === 'desktop' 
          ? Math.round(prod.orders * 0.41) 
          : Math.round(prod.orders * 0.07),
        stock: prod.currentStock,
        qualityRisk: prod.qualityRiskScore,
      };
    });
  }, [products, selectedDeviceFilter]);

  // Unique channel groups for the Heatmap table
  const channels = useMemo(() => {
    const list = Array.from(new Set(trafficData.map((t) => t.channelGroup)));
    return list;
  }, [trafficData]);

  // Format currency helper
  const fmt = (val: number) =>
    val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Interactive Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtrer par Support (Device) :</span>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
            <button
              id="filter-device-all"
              onClick={() => setSelectedDeviceFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedDeviceFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous Supports
            </button>
            <button
              id="filter-device-mobile"
              onClick={() => setSelectedDeviceFilter('mobile')}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedDeviceFilter === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile
            </button>
            <button
              id="filter-device-desktop"
              onClick={() => setSelectedDeviceFilter('desktop')}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedDeviceFilter === 'desktop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3 h-3 mr-1" />
              Desktop
            </button>
            <button
              id="filter-device-tablet"
              onClick={() => setSelectedDeviceFilter('tablet')}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedDeviceFilter === 'tablet'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3 h-3 mr-1" />
              Tablette
            </button>
          </div>
        </div>

        {/* Category quick filter & Export Action */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Catégorie :</span>
            <select
              id="select-category-filter"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Toutes les catégories</option>
              {products.map((p) => (
                <option key={p.id} value={p.category}>
                  {p.category}
                </option>
              ))}
            </select>
          </div>

          {onOpenExport && (
            <button
              id="btn-analytics-export-spreadsheet"
              onClick={onOpenExport}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
              title="Exporter les données journalières par support vers un tableur"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Exporter Tableur</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Graphs Row: Bar chart by Product + Device Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Sales & Net Revenue by Product */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Performance Commerciale par Catégorie d'Articles
              </h2>
              <p className="text-xs text-slate-500">
                Segmenté par support actif :{' '}
                <strong className="text-slate-800 capitalize">
                  {selectedDeviceFilter === 'all' ? 'Tous supports (Consolidé)' : selectedDeviceFilter}
                </strong>
              </p>
            </div>
            {/* Metric toggles */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveMetric('revenue')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeMetric === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Chiffre d'Affaires
              </button>
              <button
                onClick={() => setActiveMetric('returnRate')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeMetric === 'returnRate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Taux de Retours (%)
              </button>
              <button
                onClick={() => setActiveMetric('orders')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeMetric === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Volumes (Commandes)
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'revenue' ? (
                <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k€`} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      fmt(Number(val)),
                      name === 'grossRevenue' ? 'CA Brut' : name === 'netRevenue' ? 'CA Net (Marge réelle)' : 'Coût Retours',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="grossRevenue" name="CA Brut" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netRevenue" name="CA Net Déduit Retours" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : activeMetric === 'returnRate' ? (
                <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Taux de retour']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="returnRate" name="Taux de retour" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} cdes`, 'Commandes passées']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="orders" name="Commandes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>💡 <strong>Insight Directeur des Ventes :</strong> Le Baggy Cargo génère le plus gros CA brut (63k€) mais détruit 2 430€ en retours (36% de taux de retour).</span>
            <span className="text-rose-600 font-semibold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Attention réappro</span>
          </div>
        </div>

        {/* Device Breakdown Donut & Conversion comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Répartition par Support Client
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              Chiffre d'Affaires et Panier Moyen (AOV) par Device
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTotals}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {deviceTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [fmt(Number(val)), 'Chiffre d\'Affaires']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device Comparative Metrics */}
          <div className="space-y-2.5 mt-2">
            {deviceTotals.map((dev) => (
              <div 
                key={dev.key} 
                onClick={() => setSelectedDeviceFilter(dev.key as DeviceCategory)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedDeviceFilter === dev.key
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dev.color }} />
                    <span className="text-xs font-bold text-slate-900">{dev.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">{fmt(dev.revenue)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pl-4.5">
                  <span>Panier moy : <strong className="text-slate-700">{dev.aov.toFixed(1)} €</strong></span>
                  <span>Taux conv : <strong className="text-emerald-700">{dev.conversion.toFixed(2)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Matrix: Acquisition Channels × Devices */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matrice de Conversion : Canaux d'Acquisition × Supports Clients
            </h2>
            <p className="text-xs text-slate-500">
              Analyse détaillée du trafic e-commerce, taux de mise au panier et conversion finale
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            Données du site marchand en direct
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Canal d'Acquisition</th>
                <th className="py-2.5 px-3">Support</th>
                <th className="py-2.5 px-3 text-right">Utilisateurs</th>
                <th className="py-2.5 px-3 text-right">Sessions</th>
                <th className="py-2.5 px-3 text-right">Ajouts Panier</th>
                <th className="py-2.5 px-3 text-right">Transactions</th>
                <th className="py-2.5 px-3 text-right">Taux de Conv.</th>
                <th className="py-2.5 px-3 text-right">Panier Moyen</th>
                <th className="py-2.5 px-3 text-right">CA Généré</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {trafficData
                .filter((row) => selectedDeviceFilter === 'all' || row.deviceCategory === selectedDeviceFilter)
                .map((row) => {
                  const convPct = row.conversionRate * 100;
                  const isHighConv = convPct >= 4.0;
                  const isLowConv = convPct < 1.5;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.channelGroup}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.deviceCategory === 'mobile'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : row.deviceCategory === 'desktop'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {row.deviceCategory === 'mobile' ? (
                            <Smartphone className="w-3 h-3 mr-1" />
                          ) : row.deviceCategory === 'desktop' ? (
                            <Monitor className="w-3 h-3 mr-1" />
                          ) : (
                            <Tablet className="w-3 h-3 mr-1" />
                          )}
                          {row.deviceCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.totalUsers.toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.sessions.toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.addToCart.toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{row.transactions}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                            isHighConv
                              ? 'bg-emerald-100 text-emerald-800'
                              : isLowConv
                              ? 'bg-rose-100 text-rose-800'
                              : 'text-slate-700'
                          }`}
                        >
                          {convPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{row.aov.toFixed(1)} €</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{fmt(row.purchaseRevenue)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Constat Stratégique Directeur des Ventes :</strong> Le canal <em>Direct Desktop</em> (28 520 €) et <em>Paid Search Desktop</em> (22 500 €) affichent une conversion exceptionnelle (&gt; 5.4%), alors que <em>Organic Social Mobile</em> ne convertit qu'à 0.67%. Réorienter les investissements marketing vers les points de contact Desktop à fort panier.
          </div>
        </div>
      </div>
    </div>
  );
};
