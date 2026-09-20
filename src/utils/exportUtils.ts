import { Product, TrafficChannelData, ForecastDataPoint } from '../types';

export interface DailyResultRow {
  date: string;
  dayName: string;
  periodType: 'Réalisé (Historique)' | 'Prévisionnel (IA)';
  totalUnitsSold: number;
  grossRevenue: number;
  mobileRevenue: number;
  desktopRevenue: number;
  tabletRevenue: number;
  mobileUnitsSold: number;
  desktopUnitsSold: number;
  tabletUnitsSold: number;
  mobileSharePct: number;
  mobileSessions: number;
  desktopSessions: number;
  mobileConversionRatePct: number;
  desktopConversionRatePct: number;
  estimatedReturnUnits: number;
  estimatedReturnCost: number;
  netRevenue: number;
  closingStockUnits: number;
  stockStatus: string;
}

/**
 * Builds standard daily rows based on forecast series, products velocity, and traffic data
 */
export function generateDailyResultsData(
  forecastSeries: ForecastDataPoint[],
  products: Product[],
  trafficData: TrafficChannelData[]
): DailyResultRow[] {
  // Compute global mobile vs desktop ratio from traffic
  const mobileSessionsTotal = trafficData.filter(t => t.deviceCategory === 'mobile').reduce((acc, t) => acc + t.sessions, 0);
  const desktopSessionsTotal = trafficData.filter(t => t.deviceCategory === 'desktop').reduce((acc, t) => acc + t.sessions, 0);
  const tabletSessionsTotal = trafficData.filter(t => t.deviceCategory === 'tablet').reduce((acc, t) => acc + t.sessions, 0);
  const allSessions = mobileSessionsTotal + desktopSessionsTotal + tabletSessionsTotal || 1;

  const mobileSessionRatio = mobileSessionsTotal / allSessions; // ~0.58
  const desktopSessionRatio = desktopSessionsTotal / allSessions; // ~0.35
  const tabletSessionRatio = tabletSessionsTotal / allSessions; // ~0.07

  // Average AOV
  const totalOrders = products.reduce((acc, p) => acc + p.orders, 0) || 1;
  const totalGrossRev = products.reduce((acc, p) => acc + p.grossRevenue, 0);
  const overallAov = totalGrossRev / totalOrders; // ~118€
  const overallReturnRate = products.reduce((acc, p) => acc + p.returnsUnits, 0) / totalOrders; // ~0.29

  return forecastSeries.map((item, index) => {
    const isHistorical = item.historicalSales !== undefined;
    const units = isHistorical ? (item.historicalSales || 0) : (item.predictedSales || 0);

    // Approximate breakdown by device
    const mobileUnits = Math.round(units * 0.52);
    const desktopUnits = Math.round(units * 0.41);
    const tabletUnits = Math.max(0, units - mobileUnits - desktopUnits);

    // AOV on Desktop is traditionally ~25% higher than mobile
    const mobileAov = overallAov * 0.88;
    const desktopAov = overallAov * 1.15;
    const tabletAov = overallAov * 0.98;

    const mobileRev = Math.round(mobileUnits * mobileAov);
    const desktopRev = Math.round(desktopUnits * desktopAov);
    const tabletRev = Math.round(tabletUnits * tabletAov);
    const grossRev = mobileRev + desktopRev + tabletRev;

    // Daily estimated returns
    const returnUnits = Math.round(units * overallReturnRate);
    const returnCost = Math.round(returnUnits * 14.5);
    const netRev = grossRev - returnCost;

    // Sessions calculation
    const baseDailySessions = 2400 + (index % 7) * 180 + (units > 50 ? 400 : 0);
    const mobSessions = Math.round(baseDailySessions * mobileSessionRatio);
    const deskSessions = Math.round(baseDailySessions * desktopSessionRatio);

    const mobConv = mobSessions > 0 ? (mobileUnits / mobSessions) * 100 : 2.4;
    const deskConv = deskSessions > 0 ? (desktopUnits / deskSessions) * 100 : 5.1;

    const stock = item.stockLevel !== undefined ? item.stockLevel : 0;
    let stockStatus = 'Stock Confortable';
    if (stock === 0) {
      stockStatus = 'Rupture de Stock';
    } else if (stock <= 30) {
      stockStatus = 'Alerte Rupture Imminente';
    } else if (stock <= 80) {
      stockStatus = 'Seuil de Réassort';
    }

    return {
      date: item.date,
      dayName: item.day,
      periodType: isHistorical ? 'Réalisé (Historique)' : 'Prévisionnel (IA)',
      totalUnitsSold: units,
      grossRevenue: grossRev,
      mobileRevenue: mobileRev,
      desktopRevenue: desktopRev,
      tabletRevenue: tabletRev,
      mobileUnitsSold: mobileUnits,
      desktopUnitsSold: desktopUnits,
      tabletUnitsSold: tabletUnits,
      mobileSharePct: Number(((mobileRev / (grossRev || 1)) * 100).toFixed(1)),
      mobileSessions: mobSessions,
      desktopSessions: deskSessions,
      mobileConversionRatePct: Number(mobConv.toFixed(2)),
      desktopConversionRatePct: Number(deskConv.toFixed(2)),
      estimatedReturnUnits: returnUnits,
      estimatedReturnCost: returnCost,
      netRevenue: netRev,
      closingStockUnits: stock,
      stockStatus,
    };
  });
}

export interface ExportOptions {
  separator: ';' | ',';
  scope: 'all' | 'historical' | 'forecast';
  includeProductDetail?: boolean;
}

/**
 * Generates CSV string formatted for Excel / Google Sheets with UTF-8 BOM
 */
export function buildDailyCSV(
  dailyRows: DailyResultRow[],
  products: Product[],
  options: ExportOptions
): string {
  const sep = options.separator;

  // Filter rows by scope
  let filteredRows = dailyRows;
  if (options.scope === 'historical') {
    filteredRows = dailyRows.filter(r => r.periodType.includes('Historique'));
  } else if (options.scope === 'forecast') {
    filteredRows = dailyRows.filter(r => r.periodType.includes('Prévisionnel'));
  }

  const lines: string[] = [];

  // Metadata / Title headers
  lines.push(`STOCKPILOT - RAPPORT JOURNALIER DES VENTES & STOCKS MULTI-SUPPORTS`);
  lines.push(`Date d'exportation${sep}${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`);
  lines.push(`Périmètre sélectionné${sep}${options.scope === 'all' ? '14 jours (Historique 7j + Prévisions IA 7j)' : options.scope === 'historical' ? 'Historique réel 7 derniers jours' : 'Prévisions IA J+1 à J+7'}`);
  lines.push(``); // Blank line

  // SECTION 1: SYNTHÈSE JOURNALIÈRE
  lines.push(`=== SYNTHÈSE DES RÉSULTATS JOURNALIERS (MOBILE / TABLETTE / DESKTOP) ===`);
  const headers = [
    'Date',
    'Jour',
    'Type Période',
    'Ventes Totales (u)',
    'CA Brut (€)',
    'CA Mobile (€)',
    'Part CA Mobile (%)',
    'CA Desktop (€)',
    'CA Tablette (€)',
    'Unités Mobile (u)',
    'Unités Desktop (u)',
    'Unités Tablette (u)',
    'Taux Conv Mobile (%)',
    'Taux Conv Desktop (%)',
    'Retours Estimés (u)',
    'Coût des Retours (€)',
    'CA Net Commercial (€)',
    'Stock Fin de Journée (u)',
    'Statut Stock / Alerte',
  ];
  lines.push(headers.map(h => `"${h}"`).join(sep));

  filteredRows.forEach(row => {
    const rowValues = [
      row.date,
      row.dayName,
      row.periodType,
      row.totalUnitsSold,
      row.grossRevenue,
      row.mobileRevenue,
      row.mobileSharePct + '%',
      row.desktopRevenue,
      row.tabletRevenue,
      row.mobileUnitsSold,
      row.desktopUnitsSold,
      row.tabletUnitsSold,
      row.mobileConversionRatePct + '%',
      row.desktopConversionRatePct + '%',
      row.estimatedReturnUnits,
      row.estimatedReturnCost,
      row.netRevenue,
      row.closingStockUnits,
      row.stockStatus,
    ];
    lines.push(rowValues.map(v => `"${String(v).replace(/"/g, '""')}"`).join(sep));
  });

  // Totals Row
  const totalUnits = filteredRows.reduce((acc, r) => acc + r.totalUnitsSold, 0);
  const totalGross = filteredRows.reduce((acc, r) => acc + r.grossRevenue, 0);
  const totalMobileRev = filteredRows.reduce((acc, r) => acc + r.mobileRevenue, 0);
  const totalDesktopRev = filteredRows.reduce((acc, r) => acc + r.desktopRevenue, 0);
  const totalReturnCost = filteredRows.reduce((acc, r) => acc + r.estimatedReturnCost, 0);
  const totalNet = filteredRows.reduce((acc, r) => acc + r.netRevenue, 0);

  lines.push(
    [
      'TOTAL PÉRIODE',
      '-',
      `${filteredRows.length} journées`,
      totalUnits,
      totalGross,
      totalMobileRev,
      `${((totalMobileRev / (totalGross || 1)) * 100).toFixed(1)}%`,
      totalDesktopRev,
      totalGross - totalMobileRev - totalDesktopRev,
      filteredRows.reduce((acc, r) => acc + r.mobileUnitsSold, 0),
      filteredRows.reduce((acc, r) => acc + r.desktopUnitsSold, 0),
      filteredRows.reduce((acc, r) => acc + r.tabletUnitsSold, 0),
      '-',
      '-',
      filteredRows.reduce((acc, r) => acc + r.estimatedReturnUnits, 0),
      totalReturnCost,
      totalNet,
      filteredRows[filteredRows.length - 1]?.closingStockUnits || 0,
      '-',
    ]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(sep)
  );

  // SECTION 2: ÉTAT CATALOGUE PRODUITS & VÉLOCITÉ (if requested)
  if (options.includeProductDetail) {
    lines.push(``);
    lines.push(`=== ÉTAT DU CATALOGUE PRODUITS & VÉLOCITÉS JOURNALIÈRES ===`);
    const prodHeaders = [
      'Produit',
      'Catégorie',
      'Stock Actuel (u)',
      'Vélocité Journalière (u/j)',
      'Autonomie Estimée (jours)',
      'Délai Fournisseur (jours)',
      'Fournisseur',
      'Taux Retour Global (%)',
      'Taux Retour Mobile (%)',
      'Taux Retour Desktop (%)',
      'Coût Total Retours (€)',
      'CA Net Produit (€)',
      'Statut Approvisionnement',
    ];
    lines.push(prodHeaders.map(h => `"${h}"`).join(sep));

    products.forEach(p => {
      const daysRemaining = (p.currentStock / (p.dailyVelocity || 1)).toFixed(1);
      let status = 'Stock Normal';
      if (p.currentStock <= p.minStockThreshold) {
        status = Number(daysRemaining) < p.leadTimeDays ? 'RUPTURE CRITIQUE' : 'Alerte Réassort';
      }

      const pValues = [
        p.name,
        p.category,
        p.currentStock,
        p.dailyVelocity,
        daysRemaining,
        p.leadTimeDays,
        p.supplier,
        (p.returnRate * 100).toFixed(1) + '%',
        (p.mobileReturnRate * 100).toFixed(1) + '%',
        (p.desktopReturnRate * 100).toFixed(1) + '%',
        p.totalReturnCost,
        p.netRevenue,
        status,
      ];
      lines.push(pValues.map(v => `"${String(v).replace(/"/g, '""')}"`).join(sep));
    });
  }

  // UTF-8 BOM for Excel to recognize UTF-8 special characters (accents, currency)
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates TSV (Tab Separated Values) for direct clipboard paste into Google Sheets / Excel
 */
export function buildDailyTSV(
  dailyRows: DailyResultRow[],
  options: Pick<ExportOptions, 'scope'>
): string {
  let filteredRows = dailyRows;
  if (options.scope === 'historical') {
    filteredRows = dailyRows.filter(r => r.periodType.includes('Historique'));
  } else if (options.scope === 'forecast') {
    filteredRows = dailyRows.filter(r => r.periodType.includes('Prévisionnel'));
  }

  const lines: string[] = [];
  const headers = [
    'Date',
    'Jour',
    'Type',
    'Ventes (u)',
    'CA Brut (€)',
    'CA Mobile (€)',
    'Part Mobile (%)',
    'CA Desktop (€)',
    'Taux Conv. Mobile',
    'Taux Conv. Desktop',
    'Coût Retours (€)',
    'CA Net (€)',
    'Stock Fin Journée',
    'Statut',
  ];
  lines.push(headers.join('\t'));

  filteredRows.forEach(r => {
    lines.push(
      [
        r.date,
        r.dayName,
        r.periodType,
        r.totalUnitsSold,
        r.grossRevenue,
        r.mobileRevenue,
        r.mobileSharePct + '%',
        r.desktopRevenue,
        r.mobileConversionRatePct + '%',
        r.desktopConversionRatePct + '%',
        r.estimatedReturnCost,
        r.netRevenue,
        r.closingStockUnits,
        r.stockStatus,
      ].join('\t')
    );
  });

  return lines.join('\n');
}

/**
 * Triggers instant browser download of the CSV file
 */
export function triggerFileDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
