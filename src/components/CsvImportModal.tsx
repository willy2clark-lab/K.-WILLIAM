import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  HelpCircle, 
  RefreshCw,
  ArrowRight,
  Database
} from 'lucide-react';
import { Product } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (newProducts: Product[]) => void;
  onNotify?: (message: string) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
  onNotify,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<Product[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage("Le fichier doit être au format .CSV (valeurs séparées par des virgules ou points-virgules).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const products = parseCsvToProducts(text);
        if (products.length === 0) {
          setErrorMessage("Aucune ligne de données produit valide n'a pu être extraite du fichier CSV.");
        } else {
          setParsedData(products);
        }
      } catch (err: any) {
        setErrorMessage("Erreur lors de la lecture du fichier CSV : " + (err.message || 'Format inattendu'));
      }
    };
    reader.onerror = () => {
      setErrorMessage("Impossible de lire le fichier sélectionné.");
    };
    reader.readAsText(file);
  };

  const parseCsvToProducts = (csvText: string): Product[] => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Determine delimiter (comma or semicolon)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const headers = firstLine
      .split(delimiter)
      .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < 3) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Flexible column mapping
      const name = row['nom'] || row['name'] || row['produit'] || row['article'] || `Produit ${i}`;
      const category = row['categorie'] || row['category'] || 'Streetwear';
      const orders = parseInt(row['commandes'] || row['orders'] || row['ventes'] || '100', 10) || 100;
      const aov = parseFloat(row['panier_moyen'] || row['aov'] || row['prix'] || '75') || 75;
      const returnRateRaw = parseFloat(row['taux_retour'] || row['returnrate'] || row['retours'] || '0.15');
      const returnRate = returnRateRaw > 1 ? returnRateRaw / 100 : returnRateRaw;
      const currentStock = parseInt(row['stock'] || row['currentstock'] || '120', 10) || 120;
      const supplier = row['fournisseur'] || row['supplier'] || 'Fournisseur Partenaire';
      const leadTimeDays = parseInt(row['delai_jours'] || row['leadtimedays'] || '14', 10) || 14;

      const grossRevenue = orders * aov;
      const returnsUnits = Math.round(orders * returnRate);
      const costPerReturn = 13.5;
      const totalReturnCost = returnsUnits * costPerReturn;
      const netRevenue = Math.max(0, grossRevenue - (returnsUnits * aov) - totalReturnCost);
      const dailyVelocity = Math.max(0.5, parseFloat((orders / 30).toFixed(1)));

      products.push({
        id: `imported-${i}-${Date.now()}`,
        name,
        category,
        orders,
        aov,
        grossRevenue,
        returnRate,
        returnsUnits,
        costPerReturn,
        totalReturnCost,
        netRevenue,
        currentStock,
        minStockThreshold: 40,
        dailyVelocity,
        leadTimeDays,
        supplier,
        supplierUnitCost: Math.round(aov * 0.35),
        reorderQuantitySuggested: Math.max(50, Math.round(dailyVelocity * (leadTimeDays + 15))),
        qualityRiskScore: Math.round(returnRate * 180),
        mobileReturnRate: parseFloat((returnRate * 1.15).toFixed(2)),
        desktopReturnRate: parseFloat((returnRate * 0.85).toFixed(2)),
        tabletReturnRate: parseFloat(returnRate.toFixed(2)),
      });
    }

    return products;
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = `nom;categorie;commandes;panier_moyen;taux_retour;stock;fournisseur;delai_jours
Baggy Cargo Vintage;Streetwear;700;90;0.36;48;Atelier Textiles Nord;14
Slim-Fit Denim Selvedge;Denim;540;85;0.18;85;Denim Mill Guimarães;12
Wool Dress Trousers Sartorial;Tailoring;320;120;0.22;28;Tessitura Biella;18
Classic Chinos Stretch;Casual;450;75;0.11;140;Confezioni Porto;10
Heavyweight Hoodie Boxy;Streetwear;620;95;0.19;95;Atelier Textiles Nord;14
Oversized Poplin Shirt;Casual;280;80;0.16;110;Confezioni Porto;9`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalogue_ventes_stocks_modele.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotify) {
      onNotify('Modèle CSV téléchargé avec succès !');
    }
  };

  const handleApplyImport = () => {
    if (parsedData && parsedData.length > 0) {
      onImportProducts(parsedData);
      if (onNotify) {
        onNotify(`${parsedData.length} produits importés et actualisés dans le tableau de bord !`);
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="csv-import-modal-backdrop"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-scale-up"
        id="csv-import-modal-window"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Importer vos Données de Ventes & Stocks (CSV)
              </h2>
              <p className="text-xs text-slate-400">
                Chargez votre propre catalogue pour alimenter le tableau de bord et le Chat IA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Instructions banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Format CSV compatible :</p>
              <p className="mt-0.5 text-slate-600">
                Le fichier peut comporter les colonnes suivantes (séparateur virgule ou point-virgule) :{' '}
                <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">
                  nom, categorie, commandes, panier_moyen, taux_retour, stock, fournisseur, delai_jours
                </code>.
              </p>
              <div className="mt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>Télécharger le modèle CSV exemple (.csv)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                Glissez-déposez votre fichier CSV ici, ou cliquez pour parcourir vos dossiers
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fichiers acceptés : .CSV, .TXT (séparateurs <code className="font-mono">;</code> ou <code className="font-mono">,</code>)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table of Parsed Products */}
          {parsedData && parsedData.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Aperçu des {parsedData.length} produits détectés ({fileName})</span>
                </span>
                <span className="text-[11px] text-slate-500">Prêt pour injection</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Produit</th>
                      <th className="px-3 py-2">Catégorie</th>
                      <th className="px-3 py-2 text-right">Commandes</th>
                      <th className="px-3 py-2 text-right">CA Brut</th>
                      <th className="px-3 py-2 text-right">Retours</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedData.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                        <td className="px-3 py-2 text-slate-500">{p.category}</td>
                        <td className="px-3 py-2 text-right font-mono">{p.orders}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{p.grossRevenue.toLocaleString('fr-FR')} $</td>
                        <td className="px-3 py-2 text-right font-mono text-rose-600">{(p.returnRate * 100).toFixed(0)}%</td>
                        <td className="px-3 py-2 text-right font-mono">{p.currentStock} u.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleApplyImport}
              disabled={!parsedData || parsedData.length === 0}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <span>Actualiser le Tableau de Bord</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
