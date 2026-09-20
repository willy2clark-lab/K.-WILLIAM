import React, { useState, useMemo } from 'react';
import { Product, TrafficChannelData, ForecastDataPoint } from '../types';
import { 
  generateDailyResultsData, 
  buildDailyCSV, 
  buildDailyTSV, 
  triggerFileDownload, 
  ExportOptions 
} from '../utils/exportUtils';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  X, 
  Calendar, 
  Sliders, 
  Smartphone, 
  Monitor, 
  Info,
  CheckCircle2,
  Table
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  trafficData: TrafficChannelData[];
  forecastSeries: ForecastDataPoint[];
  onNotify?: (message: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  products,
  trafficData,
  forecastSeries,
  onNotify,
}) => {
  const [separator, setSeparator] = useState<';' | ','>(';');
  const [scope, setScope] = useState<'all' | 'historical' | 'forecast'>('all');
  const [includeProductDetail, setIncludeProductDetail] = useState<boolean>(true);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Generate full daily dataset
  const dailyRows = useMemo(() => {
    return generateDailyResultsData(forecastSeries, products, trafficData);
  }, [forecastSeries, products, trafficData]);

  // Filter preview according to scope
  const filteredRows = useMemo(() => {
    if (scope === 'historical') {
      return dailyRows.filter(r => r.periodType.includes('Historique'));
    }
    if (scope === 'forecast') {
      return dailyRows.filter(r => r.periodType.includes('Prévisionnel'));
    }
    return dailyRows;
  }, [dailyRows, scope]);

  const totalPeriodRevenue = filteredRows.reduce((acc, r) => acc + r.grossRevenue, 0);
  const totalPeriodUnits = filteredRows.reduce((acc, r) => acc + r.totalUnitsSold, 0);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const options: ExportOptions = {
      separator,
      scope,
      includeProductDetail,
    };
    const csvContent = buildDailyCSV(dailyRows, products, options);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `stockpilot_resultats_journaliers_${scope}_${dateStr}.csv`;
    triggerFileDownload(csvContent, filename);

    if (onNotify) {
      onNotify(`Fichier tableur "${filename}" téléchargé avec succès.`);
    }
  };

  const handleCopyTSV = async () => {
    const tsvContent = buildDailyTSV(dailyRows, { scope });
    try {
      await navigator.clipboard.writeText(tsvContent);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
      if (onNotify) {
        onNotify('Données journalières copiées ! Collez directement (Ctrl+V) dans Google Sheets ou Excel.');
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      id="export-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        id="export-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Export des Résultats Journaliers
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Tableur / Excel / Sheets
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Générez un tableau complet prêt pour vos réunions commerciales et analyses de rentabilité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-export-modal"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scope Selection */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Périmètre Temporel
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">14 jours complets</span>
                  <span className="text-[10px] text-slate-500">(7j réel + 7j IA)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="historical"
                    checked={scope === 'historical'}
                    onChange={() => setScope('historical')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">7 derniers jours réels</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="forecast"
                    checked={scope === 'forecast'}
                    onChange={() => setScope('forecast')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Prévisions IA J+1 à J+7</span>
                </label>
              </div>
            </div>

            {/* Separator / Excel Format */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Format du Séparateur
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="separator"
                    value=";"
                    checked={separator === ';'}
                    onChange={() => setSeparator(';')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Point-virgule ( ; )</span>
                    <p className="text-[10px] text-slate-500">Idéal Excel France / LibreOffice</p>
                  </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="separator"
                    value=","
                    checked={separator === ','}
                    onChange={() => setSeparator(',')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Virgule ( , )</span>
                    <p className="text-[10px] text-slate-500">Google Sheets / Standard US</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
                  <Table className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Contenu du Rapport
                </label>
                <label className="flex items-start space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors text-xs">
                  <input
                    type="checkbox"
                    checked={includeProductDetail}
                    onChange={(e) => setIncludeProductDetail(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 font-medium leading-tight">
                    Ajouter l'état détaillé des stocks & vélocités par produit en annexe
                  </span>
                </label>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 bg-white/70 p-2 rounded border border-slate-200/60">
                <span className="font-bold text-slate-700">Encodage :</span> UTF-8 avec BOM (caractères accentués et symboles € garantis).
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-950">Données du rapport :</span>
              <span className="text-emerald-800">
                <strong>{filteredRows.length} journées</strong> sélectionnées
              </span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-800">
                Volume cumulé : <strong>{totalPeriodUnits} unités</strong>
              </span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-800">
                CA Période : <strong>{totalPeriodRevenue.toLocaleString('fr-FR')} €</strong>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
              19 colonnes d'indicateurs journaliers
            </span>
          </div>

          {/* Live Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <Table className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Aperçu des lignes à exporter ({filteredRows.length} journées)
              </span>
              <span className="text-[11px] text-slate-500">
                Défilement horizontal disponible
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-56 scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Jour</th>
                      <th className="px-3 py-2">Période</th>
                      <th className="px-3 py-2 text-right">Ventes (u)</th>
                      <th className="px-3 py-2 text-right">CA Brut</th>
                      <th className="px-3 py-2 text-right">Part Mobile</th>
                      <th className="px-3 py-2 text-right">CA Desktop</th>
                      <th className="px-3 py-2 text-right">Retours (€)</th>
                      <th className="px-3 py-2 text-right">CA Net</th>
                      <th className="px-3 py-2 text-right">Stock Fin J</th>
                      <th className="px-3 py-2">Statut Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.dayName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.periodType.includes('Historique') 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {row.periodType.includes('Historique') ? 'Réel' : 'IA J+'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {row.totalUnitsSold}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {row.grossRevenue.toLocaleString('fr-FR')} €
                        </td>
                        <td className="px-3 py-2 text-right text-indigo-600 font-medium">
                          {row.mobileSharePct}%
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-600 font-medium whitespace-nowrap">
                          {row.desktopRevenue.toLocaleString('fr-FR')} €
                        </td>
                        <td className="px-3 py-2 text-right text-rose-500 font-medium whitespace-nowrap">
                          -{row.estimatedReturnCost} €
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900 whitespace-nowrap">
                          {row.netRevenue.toLocaleString('fr-FR')} €
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-700">
                          {row.closingStockUnits}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.closingStockUnits === 0
                              ? 'bg-rose-100 text-rose-800'
                              : row.closingStockUnits <= 30
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.stockStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Compatible Microsoft Excel, Google Sheets, LibreOffice Calc et Numbers.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Copy to Clipboard for Google Sheets */}
            <button
              id="btn-copy-daily-tsv"
              onClick={handleCopyTSV}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5 text-slate-500" />
                  <span>Copier pour Google Sheets</span>
                </>
              )}
            </button>

            {/* Download CSV */}
            <button
              id="btn-download-daily-csv"
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Télécharger le Tableur (.CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
