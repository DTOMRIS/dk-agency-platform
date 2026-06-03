export const FRANCHBOOK_TOOL_SLUG = 'franchbook-generator';

export type FranchbookSectionGroup = 'operations' | 'management' | 'standards';

export type FranchbookSectionKey =
  | 'communication'
  | 'sales_service_culture'
  | 'equipment'
  | 'logistics_warehouse'
  | 'cashier_pos'
  | 'cleaning_safety'
  | 'team'
  | 'leadership'
  | 'education_training'
  | 'order_work_satisfaction'
  | 'accounting_finance'
  | 'sales_marketing'
  | 'targets'
  | 'rules_inventory'
  | 'facility_location'
  | 'opening'
  | 'chain_management'
  | 'brand_identity'
  | 'quality_control'
  | 'audit_procedures';

export type FranchbookSectionOutline = {
  key: FranchbookSectionKey;
  group: FranchbookSectionGroup;
  source: 'AFA Akademiya';
};

export type FranchbookSectionContent = {
  purpose: string;
  procedure: string[];
  controls: string[];
  template: string;
};

export type FranchbookContent = Record<FranchbookSectionKey, FranchbookSectionContent>;

export type FranchbookInputs = {
  brand: string;
  sector: string;
  operationDescription: string;
  standards: string;
  staff: string;
  supply: string;
  openingProcess: string;
};

export const FRANCHBOOK_OUTLINE: readonly FranchbookSectionOutline[] = [
  { key: 'communication', group: 'operations', source: 'AFA Akademiya' },
  { key: 'sales_service_culture', group: 'operations', source: 'AFA Akademiya' },
  { key: 'equipment', group: 'operations', source: 'AFA Akademiya' },
  { key: 'logistics_warehouse', group: 'operations', source: 'AFA Akademiya' },
  { key: 'cashier_pos', group: 'operations', source: 'AFA Akademiya' },
  { key: 'cleaning_safety', group: 'operations', source: 'AFA Akademiya' },
  { key: 'team', group: 'management', source: 'AFA Akademiya' },
  { key: 'leadership', group: 'management', source: 'AFA Akademiya' },
  { key: 'education_training', group: 'management', source: 'AFA Akademiya' },
  { key: 'order_work_satisfaction', group: 'management', source: 'AFA Akademiya' },
  { key: 'accounting_finance', group: 'management', source: 'AFA Akademiya' },
  { key: 'sales_marketing', group: 'management', source: 'AFA Akademiya' },
  { key: 'targets', group: 'management', source: 'AFA Akademiya' },
  { key: 'rules_inventory', group: 'management', source: 'AFA Akademiya' },
  { key: 'facility_location', group: 'management', source: 'AFA Akademiya' },
  { key: 'opening', group: 'management', source: 'AFA Akademiya' },
  { key: 'chain_management', group: 'management', source: 'AFA Akademiya' },
  { key: 'brand_identity', group: 'standards', source: 'AFA Akademiya' },
  { key: 'quality_control', group: 'standards', source: 'AFA Akademiya' },
  { key: 'audit_procedures', group: 'standards', source: 'AFA Akademiya' },
];

export function isFranchbookSectionKey(value: string): value is FranchbookSectionKey {
  return FRANCHBOOK_OUTLINE.some((section) => section.key === value);
}
