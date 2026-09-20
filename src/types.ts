export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

export interface Product {
  id: string;
  name: string;
  category: string;
  orders: number;
  aov: number;
  grossRevenue: number;
  returnRate: number; // e.g. 0.36 for 36%
  returnsUnits: number;
  costPerReturn: number;
  totalReturnCost: number;
  netRevenue: number;
  currentStock: number;
  minStockThreshold: number;
  dailyVelocity: number; // units sold / day
  leadTimeDays: number;
  supplier: string;
  supplierUnitCost: number;
  reorderQuantitySuggested: number;
  qualityRiskScore: number; // 0 to 100
  mobileReturnRate: number;
  desktopReturnRate: number;
  tabletReturnRate: number;
}

export interface TrafficChannelData {
  id: string;
  channelGroup: string;
  deviceCategory: DeviceCategory;
  totalUsers: number;
  sessions: number;
  engagedSessions: number;
  addToCart: number;
  transactions: number;
  purchaseRevenue: number;
  conversionRate: number; // transactions / sessions
  cartToPurchaseRate: number; // transactions / addToCart
  aov: number;
}

export interface CustomerReview {
  id: string;
  productId: string;
  productName: string;
  author: string;
  date: string;
  rating: number; // 1-5
  deviceCategory: DeviceCategory;
  text: string;
  returned: boolean;
  returnReason?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  extractedIssues: string[];
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  currentStock: number;
  predictedDaysRemaining: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'validated' | 'sent' | 'received';
  urgent: boolean;
  aiRationale: string;
  estimatedDeliveryDate: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  deviceCorrelation?: string;
  actionType: 'reorder' | 'freeze_supplier' | 'adjust_mobile_ux' | 'rebalance_stock';
  actionLabel: string;
  executed?: boolean;
}

export interface DailyFeedCard {
  id: string;
  type: 'flash_sales' | 'stock_risk' | 'sentiment_anomaly' | 'po_suggestion';
  title: string;
  description: string;
  badge: string;
  timestamp: string;
  metrics?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  suggestedAction?: {
    label: string;
    actionType: string;
    targetId?: string;
  };
  dismissed?: boolean;
}

export interface ForecastDataPoint {
  date: string;
  day: string;
  historicalSales?: number;
  predictedSales?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  stockLevel?: number;
}

export interface WhatIfSimulation {
  mobileBudgetIncreasePct: number; // e.g. 0 to +50%
  sizeGuideFixReturnReductionPct: number; // e.g. 0 to 40% reduction
  reorderDelayDays: number;
}

export interface AIAnalysisResult {
  executiveSummary: string;
  primaryAlert: string;
  keyIssues: {
    issue: string;
    frequency: number;
    impactedProduct: string;
    deviceSpecific: string;
    recommendation: string;
  }[];
  predictedReturnReductionOpportunity: number;
  supplierActionPlan: string[];
}

export type UserRole = 'admin' | 'partner';
