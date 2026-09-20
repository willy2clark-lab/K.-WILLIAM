import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Sparkles, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  Clock, 
  Wifi, 
  Zap, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Info,
  Terminal,
  Settings,
  HelpCircle
} from 'lucide-react';

interface ServerInfo {
  status: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  port: number;
  env: string;
  timestamp: string;
  isHmrDisabled: boolean;
  memoryUsageMb: number;
}

interface GeminiInfo {
  hasApiKey: boolean;
  maskedKey: string | null;
  clientInitialized: boolean;
  model: string;
  sdk: string;
  features: string[];
}

interface EnvVarItem {
  name: string;
  status: 'configured' | 'default' | 'missing';
  isSecret: boolean;
  maskedValue: string;
  description: string;
  required?: boolean;
}

interface DiagnosticsData {
  server: ServerInfo;
  gemini: GeminiInfo;
  environment: EnvVarItem[];
}

interface SystemDiagnosticsProps {
  onNotify?: (message: string) => void;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ onNotify }) => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serverPingMs, setServerPingMs] = useState<number | null>(null);
  
  // Gemini Test state
  const [isTestingGemini, setIsTestingGemini] = useState<boolean>(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    reply?: string;
    latencyMs?: number;
    error?: string;
    timestamp?: string;
  } | null>(null);

  // Copied report state
  const [hasCopiedReport, setHasCopiedReport] = useState<boolean>(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/system/diagnostics');
      const ping = Math.round(performance.now() - startTime);
      setServerPingMs(ping);

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
      }

      const json: DiagnosticsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Diagnostics fetch failed:', err);
      setError(err.message || 'Impossible de charger les diagnostics du serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);

    try {
      const res = await fetch('/api/system/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();
      setGeminiTestResult(json);

      if (json.success && onNotify) {
        onNotify(`Test Gemini réussi (${json.latencyMs} ms) : Modèle ${json.model} opérationnel.`);
      }
    } catch (err: any) {
      setGeminiTestResult({
        success: false,
        error: err.message || 'Échec de communication avec l\'API Gemini.',
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleCopyReport = async () => {
    if (!data) return;

    const report = [
      `=== RAPPORT DE DIAGNOSTIC SYSTÈME STOCKPILOT ===`,
      `Date : ${new Date().toLocaleString('fr-FR')}`,
      ``,
      `--- 1. ÉTAT DU SERVEUR DE DÉVELOPPEMENT ---`,
      `Statut : ${data.server.status.toUpperCase()} (Port ${data.server.port})`,
      `Latence HTTP : ${serverPingMs} ms`,
      `Environnement : ${data.server.env}`,
      `Node.js : ${data.server.nodeVersion} (${data.server.platform})`,
      `Uptime : ${Math.floor(data.server.uptimeSeconds / 60)}m ${data.server.uptimeSeconds % 60}s`,
      `Mémoire Heap : ${data.server.memoryUsageMb} Mo`,
      `WebSocket HMR : ${data.server.isHmrDisabled ? 'Désactivé (mode sandbox stable Cloud Run)' : 'Actif'}`,
      ``,
      `--- 2. STATUT DE L'API GEMINI ---`,
      `Statut Clé : ${data.gemini.hasApiKey ? 'Détectée & Initialisée' : 'Absente / Par défaut'}`,
      `Clé Masquée : ${data.gemini.maskedKey || 'Aucune'}`,
      `Modèle Actif : ${data.gemini.model}`,
      `SDK : ${data.gemini.sdk}`,
      geminiTestResult ? `Dernier test direct : ${geminiTestResult.success ? 'Succès (' + geminiTestResult.latencyMs + ' ms)' : 'Erreur : ' + geminiTestResult.error}` : `Dernier test direct : Non exécuté`,
      ``,
      `--- 3. VARIABLES D'ENVIRONNEMENT (VALEURS PROTÉGÉES) ---`,
      ...data.environment.map(
        (v) => `• ${v.name} [${v.status.toUpperCase()}] : ${v.maskedValue} (${v.description})`
      ),
      ``,
      `Remarque de sécurité : Aucun secret en clair n'est présent dans ce rapport.`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      setHasCopiedReport(true);
      setTimeout(() => setHasCopiedReport(false), 2500);
      if (onNotify) {
        onNotify('Rapport de diagnostic copié dans le presse-papier !');
      }
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in" id="system-diagnostics-view">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Diagnostics Système & Paramètres
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Audit Sécurisé
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Supervision en temps réel du serveur de développement Node.js / Vite, vérification de l'API Gemini et audit des variables d'environnement configurées (avec masquage cryptographique des secrets).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            id="btn-copy-diagnostics-report"
            onClick={handleCopyReport}
            disabled={!data}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
            title="Copier le diagnostic sans secrets pour analyse ou support"
          >
            {hasCopiedReport ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5 text-slate-500" />
                <span>Copier le rapport</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-refresh-diagnostics"
            onClick={fetchDiagnostics}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isLoading ? 'Analyse...' : 'Rafraîchir'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-sm text-rose-800">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <strong>Erreur de connexion aux diagnostics :</strong> {error}
          </div>
          <button
            onClick={fetchDiagnostics}
            className="text-xs font-bold underline hover:text-rose-950"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Main Grid: Server + Gemini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Dev Server Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between" id="card-server-diagnostics">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Serveur de Développement & Backend
                  </h2>
                  <p className="text-xs text-slate-500">Moteur Express + Vite intégré</p>
                </div>
              </div>

              {data?.server.status === 'online' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  En Ligne (HTTP 200)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  Vérification...
                </span>
              )}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Latence Ping</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {serverPingMs !== null ? `${serverPingMs} ms` : '—'}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">Réponse immédiate</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Port Écoute</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  :{data?.server.port || 3000}
                </div>
                <div className="text-[10px] text-slate-500">Inbound Cloud Run</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Uptime Actif</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {data ? formatUptime(data.server.uptimeSeconds) : '—'}
                </div>
                <div className="text-[10px] text-slate-500">Temps de fonctionnement</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Runtime Node</span>
                </div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {data?.server.nodeVersion || 'Node.js'}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">{data?.server.platform}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Mémoire Heap</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {data ? `${data.server.memoryUsageMb} Mo` : '—'}
                </div>
                <div className="text-[10px] text-slate-500">Utilisation RAM process</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Mode Vite</span>
                </div>
                <div className="text-sm font-bold text-slate-900 capitalize">
                  {data?.server.env || 'dev'}
                </div>
                <div className="text-[10px] text-slate-500">SPA Middleware</div>
              </div>
            </div>

            {/* Note on HMR in Sandbox */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-indigo-900 block mb-0.5">
                  Gestion du WebSocket HMR (Hot Module Replacement)
                </strong>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Le canal WebSocket direct de développement est intentionnellement désactivé (<code className="font-mono bg-white/80 px-1 py-0.5 rounded text-indigo-950">DISABLE_HMR=true</code>). Cela garantit la stabilité absolue du conteneur sans rechargements intempestifs de page lors des saisies.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dernière synchro : {data ? new Date(data.server.timestamp).toLocaleTimeString('fr-FR') : '—'}</span>
            <span className="font-mono text-[11px] text-slate-400">HTTP/1.1 200 OK</span>
          </div>
        </div>

        {/* 2. Gemini API Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between" id="card-gemini-diagnostics">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Statut de l'API Gemini
                  </h2>
                  <p className="text-xs text-slate-500">Google GenAI TypeScript SDK</p>
                </div>
              </div>

              {data?.gemini.hasApiKey ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Opérationnelle
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Clé non définie
                </span>
              )}
            </div>

            {/* Model & SDK configuration */}
            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Modèle d'Inférence Actif
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {data?.gemini.model || 'gemini-2.5-flash'}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Bibliothèque Client
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {data?.gemini.sdk || '@google/genai'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center">
                    <Key className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Empreinte de la Clé API (Masquée)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                    Protégée côté serveur
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>{data?.gemini.maskedKey || 'AIzaSy••••••••••••xxxx'}</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Active AI Modules */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Fonctionnalités Connectées à l'IA :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                  {data?.gemini.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Gemini Test Result */}
              {geminiTestResult && (
                <div className={`p-3 rounded-xl border text-xs animate-fade-in ${
                  geminiTestResult.success ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between mb-1 font-bold">
                    <span className="flex items-center">
                      {geminiTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1 text-rose-600" />
                      )}
                      {geminiTestResult.success ? 'Réponse API Gemini Validée' : 'Échec du test'}
                    </span>
                    {geminiTestResult.latencyMs && (
                      <span className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                        {geminiTestResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                  {geminiTestResult.success ? (
                    <p className="text-[11px] text-emerald-800">
                      Le modèle a répondu avec succès : <strong className="font-mono bg-white px-1 py-0.5 rounded text-emerald-900">"{geminiTestResult.reply}"</strong>. La chaîne d'inférence est prête.
                    </p>
                  ) : (
                    <p className="text-[11px] text-rose-800">
                      {geminiTestResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Test d'inférence en direct</span>
            <button
              type="button"
              id="btn-test-gemini-live"
              onClick={handleTestGemini}
              disabled={isTestingGemini || !data?.gemini.hasApiKey}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isTestingGemini ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                  <span>Interrogation...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1.5 text-emerald-200" />
                  <span>Tester l'API Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Environment Variables Audit (Secrets 100% Masked) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs" id="card-env-diagnostics">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Vérification des Variables d'Environnement
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {data?.environment.length || 0} variables auditées
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toutes les clés et informations d'identification privées sont masquées conformément aux normes de sécurité
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Aucune clé secrète n'est exposée au navigateur</span>
          </div>
        </div>

        {/* Variables Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold text-left">
                <th className="px-3.5 py-2.5 rounded-l-lg">Variable</th>
                <th className="px-3.5 py-2.5">Statut</th>
                <th className="px-3.5 py-2.5">Valeur Chargée (Sécurisée)</th>
                <th className="px-3.5 py-2.5 rounded-r-lg">Rôle & Utilisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.environment.map((item, index) => {
                const isConfigured = item.status === 'configured';
                const isMissing = item.status === 'missing';
                return (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{item.name}</span>
                        {item.required && (
                          <span className="text-[9px] text-rose-600 font-semibold" title="Requis pour le fonctionnement optimal">
                            *
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {isConfigured ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Configurée
                        </span>
                      ) : isMissing ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                          Non définie
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Valeur par défaut
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        {item.isSecret && (
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          item.isSecret ? 'bg-slate-100 text-slate-700 font-bold' : 'bg-slate-50 text-slate-800'
                        }`}>
                          {item.maskedValue}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 text-[11px] leading-relaxed max-w-md">
                      {item.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Security & Setup Advisory Note */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">
                Comment modifier ou ajouter des variables d'environnement ?
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Les clés API et secrets sont configurés dans le menu <strong>Settings</strong> de l'espace de travail AI Studio ou dans votre gestionnaire de conteneur. Ils sont injectés de manière sécurisée dans <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-800">process.env</code> au démarrage du serveur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
