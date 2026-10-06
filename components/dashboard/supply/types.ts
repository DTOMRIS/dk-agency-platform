/** TASK-0498 — supply API cavablarının client tipləri (JSON-da tarixlər ISO string-dir). */

export interface SupplierItem {
  id: number;
  displayName: string;
  company: string | null;
  phones: string[];
  categories: string[];
  sourceGroups: string[];
  firstSeen: string;
  lastSeen: string;
  postCount: number;
  sampleOffers: Array<{ text: string; date: string; group: string; k: string }>;
  status: string;
  publicConsent: boolean;
  notes: string | null;
}

export interface SupplierListResponse {
  rows: SupplierItem[];
  total: number;
  page: number;
  pageSize: number;
  groups: string[];
  summary: { total: number; withPhone: number; consented: number };
}

export interface MatchItem {
  id: number;
  displayName: string;
  company: string | null;
  phones: string[];
  categories: string[];
  lastSeen: string;
  status: string;
  overlap: number;
}

export interface RequestItem {
  id: number;
  requesterName: string;
  phones: string[];
  text: string;
  categories: string[];
  requestType: string;
  sourceGroup: string;
  postedAt: string;
  status: string;
  notes: string | null;
  matchCount: number;
  matches: MatchItem[];
}

export interface RequestListResponse {
  rows: RequestItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportSummary {
  group: string;
  since: string;
  firstDate: string | null;
  lastDate: string | null;
  messagesTotal: number;
  messagesInWindow: number;
  classCounts: Array<{ cls: string; messages: number; unique: number }>;
  reference: {
    offerSenders: number;
    offerUnique: number;
    requestSenders: number;
    requestUnique: number;
  };
  suppliers: {
    total: number;
    withPhone: number;
    offers: number;
    categories: Record<string, number>;
    sample: Array<{
      displayName: string;
      phones: number;
      categories: string[];
      posts: number;
      lastSeen: string;
    }>;
  };
  requests: {
    total: number;
    byType: Record<string, number>;
    categories: Record<string, number>;
    sample: Array<{
      requesterName: string;
      requestType: string;
      categories: string[];
      text: string;
      postedAt: string;
    }>;
  };
  db?:
    | {
        state: 'ready';
        existingSuppliers: number;
        newSuppliers: number;
        existingRequests: number;
        newRequests: number;
      }
    | { state: 'tables_missing' }
    | { state: 'unavailable' };
  result?: {
    suppliersInserted: number;
    suppliersUpdated: number;
    requestsInserted: number;
    requestsSkipped: number;
  };
}
