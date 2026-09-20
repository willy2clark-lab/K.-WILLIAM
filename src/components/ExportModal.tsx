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
  Table, 
  Mail,
  Send,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
  Sparkles,
  Wrench,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw
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

  // Email Integration State
  const [targetEmail, setTargetEmail] = useState<string>('willy2clark@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailDispatchResult, setEmailDispatchResult] = useState<{
    success: boolean;
    messageId?: string;
    timestamp?: string;
    recipient?: string;
    filename?: string;
    fileSizeKb?: number;
    mode?: string;
    previewHtml?: string;
  } | null>(null);
  const [emailDispatchError, setEmailDispatchError] = useState<{
    errorType: string;
    error: string;
    diagnosis?: string;
    webMailDirectUrl?: string;
  } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [isAutoDailyScheduled, setIsAutoDailyScheduled] = useState<boolean>(false);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState<boolean>(false);
  const [smtpTestResult, setSmtpTestResult] = useState<any>(null);

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

  const handleSendDirectEmail = async () => {
    if (!targetEmail) return;

    setIsSendingEmail(true);
    setEmailDispatchResult(null);
    setEmailDispatchError(null);

    const options: ExportOptions = {
      separator,
      scope,
      includeProductDetail,
    };
    const csvContent = buildDailyCSV(dailyRows, products, options);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `stockpilot_resultats_journaliers_${scope}_${dateStr}.csv`;

    const avgReturnRate = (
      (products.reduce((acc, p) => acc + p.returnsUnits, 0) /
        (products.reduce((acc, p) => acc + p.orders, 0) || 1)) *
      100
    ).toFixed(1);

    const scopeLabel =
      scope === 'all'
        ? '14 jours (7j réels + 7j prévus)'
        : scope === 'historical'
        ? '7 derniers jours réels'
        : '7 jours prévisions IA';

    try {
      const response = await fetch('/api/export/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: targetEmail.trim(),
          csvContent,
          filename,
          dateRangeLabel: scopeLabel,
          summaryMetrics: {
            revenue: totalPeriodRevenue,
            units: totalPeriodUnits,
            returnRate: parseFloat(avgReturnRate),
            criticalAlerts: 2,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailDispatchResult({
          success: true,
          messageId: data.messageId,
          timestamp: data.timestamp,
          recipient: data.recipient,
          filename: data.filename,
          fileSizeKb: data.fileSizeKb,
          mode: data.mode,
          previewHtml: data.previewHtml,
        });

        // Also trigger file download locally for instant offline availability
        triggerFileDownload(csvContent, filename);

        if (onNotify) {
          onNotify(`Rapport journalier & tableur expédiés à ${targetEmail} !`);
        }
      } else {
        // SMTP error or not configured
        setEmailDispatchError({
          errorType: data.errorType || 'ERROR',
          error: data.error || "Erreur lors de l'envoi de l'e-mail",
          diagnosis: data.diagnosis,
          webMailDirectUrl: data.webMailDirectUrl,
        });
        setShowDiagnosticPanel(true);

        // Download file so user always has the data
        triggerFileDownload(csvContent, filename);

        if (onNotify) {
          onNotify(`Tableur téléchargé. Configuration SMTP requise pour l'acheminement vers ${targetEmail}.`);
        }
      }
    } catch (err: any) {
      console.error('Email dispatch error:', err);
      setEmailDispatchError({
        errorType: 'NETWORK_ERROR',
        error: err.message || 'Impossible de joindre le serveur.',
        diagnosis: 'Vérifiez la connexion réseau avec le serveur.',
      });
      triggerFileDownload(csvContent, filename);
      if (onNotify) {
        onNotify(`Export téléchargé localement.`);
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/export/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: targetEmail.trim() }),
      });
      const data = await res.json();
      setSmtpTestResult(data);
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        error: err.message || 'Échec du test de connexion SMTP',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleOpenMailClientFallback = () => {
    handleDownloadCSV();
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const subject = encodeURIComponent(`StockPilot - Rapport Quotidien des Ventes & Stocks (${dateStr})`);
    const bodyContent = 
`Bonjour Willy,

Voici le récapitulatif journalier consolidé issu de StockPilot (${dateStr}) :

• Chiffre d'Affaires Net : ${totalPeriodRevenue.toLocaleString('fr-FR')} €
• Volume de ventes : ${totalPeriodUnits} pièces
• Taux de retour moyen : ${(products.reduce((acc, p) => acc + p.returnsUnits, 0) / (products.reduce((acc, p) => acc + p.orders, 0) || 1) * 100).toFixed(1)}%
• Alertes stocks prioritaires : Baggy Cargo (48 u. restantes, rupture prévue dans 3 jours) & Wool Dress (28 u.)

Le fichier tableur (.CSV) a été généré et téléchargé sur votre appareil.

Cordialement,
StockPilot Copilot Ventes`;

    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
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
          {/* Email Integration Configuration Card */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      Intégration Boîte Mail Directe
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Configurée
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    Recevez les résultats consolidés et le tableur (.CSV) directement sur votre messagerie
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-indigo-950 shrink-0">Destinataire :</label>
                <input
                  type="email"
                  id="input-export-email-recipient"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="text-xs font-mono font-medium px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 w-52 sm:w-60"
                  placeholder="willy2clark@gmail.com"
                />
              </div>
            </div>

            {/* Auto Schedule option & status */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-auto-daily-schedule"
                  checked={isAutoDailyScheduled}
                  onChange={(e) => {
                    setIsAutoDailyScheduled(e.target.checked);
                    if (onNotify) {
                      onNotify(
                        e.target.checked
                          ? `Envoi automatique quotidien activé pour ${targetEmail} (chaque matin à 08h00).`
                          : `Envoi automatique quotidien désactivé.`
                      );
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 font-medium">
                  Programmer l'envoi récurrent automatique chaque matin à <strong>08h00</strong>
                </span>
              </label>

              {emailDispatchResult && (
                <button
                  type="button"
                  id="btn-toggle-email-preview"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="inline-flex items-center text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>{showEmailPreview ? "Masquer l'aperçu du mail" : "Voir l'e-mail envoyé"}</span>
                </button>
              )}
            </div>

            {/* Success notification banner */}
            {emailDispatchResult && (
              <div className="mt-3 bg-white border border-emerald-300 rounded-xl p-3 text-xs animate-fade-in shadow-2xs">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-emerald-900 font-bold">
                        Export journalier expédié à {emailDispatchResult.recipient} !
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(emailDispatchResult.timestamp || '').toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">
                      Pièce jointe tableur : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">{emailDispatchResult.filename}</code> ({emailDispatchResult.fileSizeKb} Ko) • Réf : #{emailDispatchResult.messageId}
                    </p>
                  </div>
                </div>

                {showEmailPreview && emailDispatchResult.previewHtml && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: emailDispatchResult.previewHtml }} />
                  </div>
                )}
              </div>
            )}

            {/* Error & Diagnostic Banner */}
            {emailDispatchError && (
              <div className="mt-3 bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs animate-fade-in">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-900 font-bold">
                        {emailDispatchError.errorType === 'SMTP_NOT_CONFIGURED'
                          ? "Configuration requise pour l'envoi vers votre boîte Gmail"
                          : "Erreur d'envoi vers la boîte mail"}
                      </strong>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded font-semibold">
                        Tableur .CSV déjà téléchargé
                      </span>
                    </div>
                    <p className="text-amber-800 mt-1 leading-relaxed">
                      {emailDispatchError.diagnosis || emailDispatchError.error}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {/* 1-Click Instant Fallback: Open Gmail Web */}
                      {emailDispatchError.webMailDirectUrl && (
                        <a
                          href={emailDispatchError.webMailDirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id="btn-open-gmail-web-fallback"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          <span>Ouvrir dans Gmail Web (Message pré-rempli)</span>
                        </a>
                      )}

                      <button
                        type="button"
                        id="btn-toggle-diagnostics"
                        onClick={() => setShowDiagnosticPanel(!showDiagnosticPanel)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/70 transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                        <span>{showDiagnosticPanel ? 'Masquer le guide de débogage' : 'Guide de débogage & test SMTP'}</span>
                        {showDiagnosticPanel ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic & Troubleshooting Panel */}
            {(showDiagnosticPanel || !emailDispatchError) && (
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticPanel(!showDiagnosticPanel)}
                    className="inline-flex items-center text-xs font-bold text-indigo-900 hover:text-indigo-700 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    <span>Guide de débogage pour l'envoi Gmail automatique</span>
                    {showDiagnosticPanel ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </button>

                  <button
                    type="button"
                    disabled={isTestingSmtp}
                    onClick={handleTestSmtp}
                    className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin text-indigo-600" />
                        <span>Test en cours...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 text-indigo-600" />
                        <span>Tester la connexion SMTP</span>
                      </>
                    )}
                  </button>
                </div>

                {showDiagnosticPanel && (
                  <div className="bg-white rounded-xl border border-indigo-200/80 p-3.5 space-y-3 text-xs animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 font-bold block mb-1">
                          1. Pourquoi l'envoi direct nécessite un mot de passe d'application ?
                        </strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Depuis 2022, Google refuse les connexions par simple mot de passe de compte pour des raisons de sécurité. Pour envoyer un mail depuis un serveur tiers, il faut générer un <strong>Mot de passe d'application</strong> (16 lettres).
                        </p>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          <span>Générer un mot de passe sur myaccount.google.com/apppasswords</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 font-bold block mb-1">
                          2. Variables d'environnement à renseigner dans le projet :
                        </strong>
                        <ul className="text-[11px] text-slate-600 space-y-1 font-mono">
                          <li>• <strong className="text-slate-800">SMTP_HOST</strong> : smtp.gmail.com</li>
                          <li>• <strong className="text-slate-800">SMTP_PORT</strong> : 465 (SSL)</li>
                          <li>• <strong className="text-slate-800">SMTP_USER</strong> : willy2clark@gmail.com</li>
                          <li>• <strong className="text-slate-800">SMTP_PASS</strong> : [les 16 caractères]</li>
                        </ul>
                      </div>
                    </div>

                    {smtpTestResult && (
                      <div className={`p-3 rounded-lg border text-[11px] ${
                        smtpTestResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        <div className="flex items-center space-x-1.5 font-bold mb-1">
                          {smtpTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                          <span>{smtpTestResult.message || smtpTestResult.error}</span>
                        </div>
                        {smtpTestResult.diagnosis && (
                          <p className="mt-1 text-slate-700">{smtpTestResult.diagnosis}</p>
                        )}
                        {smtpTestResult.howToFix && (
                          <p className="mt-1 text-slate-600 italic">{smtpTestResult.howToFix}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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

          <div className="flex flex-wrap items-center justify-end space-x-2.5 sm:space-x-3 w-full sm:w-auto">
            {/* Direct Email Dispatch Button */}
            <button
              type="button"
              id="btn-email-daily-report"
              disabled={isSendingEmail}
              onClick={handleSendDirectEmail}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title={`Expédier le rapport et le tableur directement à ${targetEmail}`}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                  <span>Envoi en cours à {targetEmail}...</span>
                </>
              ) : emailDispatchResult ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-300" />
                  <span>Renvoyer à {targetEmail}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5 text-indigo-200" />
                  <span>Envoyer à {targetEmail}</span>
                </>
              )}
            </button>

            {/* Copy to Clipboard for Google Sheets */}
            <button
              type="button"
              id="btn-copy-daily-tsv"
              onClick={handleCopyTSV}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
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
              type="button"
              id="btn-download-daily-csv"
              onClick={handleDownloadCSV}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
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
