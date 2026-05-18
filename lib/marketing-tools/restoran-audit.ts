/**
 * @file restoran-audit.ts
 * @purpose Restaurant self-audit scoring engine for TASK-0149
 * @task TASK-0149
 * @lastModified 2026-05-18
 */

export type AuditAreaId =
  | 'finance_cash'
  | 'operations_kitchen'
  | 'staff_service'
  | 'customer_experience'
  | 'digital_presence'
  | 'compliance_risk';

export type AuditQuestionId =
  | 'finance_cash_q1'
  | 'finance_cash_q2'
  | 'finance_cash_q3'
  | 'finance_cash_q4'
  | 'finance_cash_q5'
  | 'operations_kitchen_q1'
  | 'operations_kitchen_q2'
  | 'operations_kitchen_q3'
  | 'operations_kitchen_q4'
  | 'operations_kitchen_q5'
  | 'staff_service_q1'
  | 'staff_service_q2'
  | 'staff_service_q3'
  | 'staff_service_q4'
  | 'staff_service_q5'
  | 'customer_experience_q1'
  | 'customer_experience_q2'
  | 'customer_experience_q3'
  | 'customer_experience_q4'
  | 'customer_experience_q5'
  | 'digital_presence_q1'
  | 'digital_presence_q2'
  | 'digital_presence_q3'
  | 'digital_presence_q4'
  | 'digital_presence_q5'
  | 'compliance_risk_q1'
  | 'compliance_risk_q2'
  | 'compliance_risk_q3'
  | 'compliance_risk_q4'
  | 'compliance_risk_q5';

export type AuditAnswerValue = 0 | 1 | 2;

export type AuditLevel = 'sagird' | 'kalfa' | 'usta';

export type ActionSeverity = 'critical' | 'warning' | 'stable';

export type AuditQuestion = {
  id: AuditQuestionId;
  areaId: AuditAreaId;
  critical?: boolean;
};

export type AreaScore = {
  areaId: AuditAreaId;
  score: number;
  rawScore: number;
  maxScore: number;
  severity: ActionSeverity;
};

export type PriorityAction = {
  areaId: AuditAreaId;
  score: number;
  severity: ActionSeverity;
  actionKey: string;
};

export type RestaurantAuditResult = {
  areaScores: AreaScore[];
  overallScore: number;
  level: AuditLevel;
  priorityActions: PriorityAction[];
  urgentQuestionIds: AuditQuestionId[];
  unknownCriticalQuestionIds: AuditQuestionId[];
  primeCostWarning: boolean;
};

export type AuditAnswers = Partial<Record<AuditQuestionId, AuditAnswerValue>>;

export const AUDIT_AREAS: AuditAreaId[] = [
  'finance_cash',
  'operations_kitchen',
  'staff_service',
  'customer_experience',
  'digital_presence',
  'compliance_risk',
];

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  { id: 'finance_cash_q1', areaId: 'finance_cash', critical: true },
  { id: 'finance_cash_q2', areaId: 'finance_cash' },
  { id: 'finance_cash_q3', areaId: 'finance_cash', critical: true },
  { id: 'finance_cash_q4', areaId: 'finance_cash', critical: true },
  { id: 'finance_cash_q5', areaId: 'finance_cash', critical: true },
  { id: 'operations_kitchen_q1', areaId: 'operations_kitchen' },
  { id: 'operations_kitchen_q2', areaId: 'operations_kitchen' },
  { id: 'operations_kitchen_q3', areaId: 'operations_kitchen' },
  { id: 'operations_kitchen_q4', areaId: 'operations_kitchen' },
  { id: 'operations_kitchen_q5', areaId: 'operations_kitchen' },
  { id: 'staff_service_q1', areaId: 'staff_service' },
  { id: 'staff_service_q2', areaId: 'staff_service' },
  { id: 'staff_service_q3', areaId: 'staff_service' },
  { id: 'staff_service_q4', areaId: 'staff_service' },
  { id: 'staff_service_q5', areaId: 'staff_service' },
  { id: 'customer_experience_q1', areaId: 'customer_experience' },
  { id: 'customer_experience_q2', areaId: 'customer_experience' },
  { id: 'customer_experience_q3', areaId: 'customer_experience' },
  { id: 'customer_experience_q4', areaId: 'customer_experience' },
  { id: 'customer_experience_q5', areaId: 'customer_experience' },
  { id: 'digital_presence_q1', areaId: 'digital_presence' },
  { id: 'digital_presence_q2', areaId: 'digital_presence' },
  { id: 'digital_presence_q3', areaId: 'digital_presence' },
  { id: 'digital_presence_q4', areaId: 'digital_presence' },
  { id: 'digital_presence_q5', areaId: 'digital_presence' },
  { id: 'compliance_risk_q1', areaId: 'compliance_risk', critical: true },
  { id: 'compliance_risk_q2', areaId: 'compliance_risk' },
  { id: 'compliance_risk_q3', areaId: 'compliance_risk' },
  { id: 'compliance_risk_q4', areaId: 'compliance_risk' },
  { id: 'compliance_risk_q5', areaId: 'compliance_risk' },
];

export const DEFAULT_AUDIT_ANSWERS: Record<AuditQuestionId, AuditAnswerValue> =
  AUDIT_QUESTIONS.reduce((acc, question) => {
    acc[question.id] = 1;
    return acc;
  }, {} as Record<AuditQuestionId, AuditAnswerValue>);

export function getAuditQuestionsByArea(areaId: AuditAreaId): AuditQuestion[] {
  return AUDIT_QUESTIONS.filter((question) => question.areaId === areaId);
}

export function getAuditLevel(score: number): AuditLevel {
  if (score >= 80) return 'usta';
  if (score >= 50) return 'kalfa';
  return 'sagird';
}

export function getActionSeverity(score: number): ActionSeverity {
  if (score < 50) return 'critical';
  if (score < 80) return 'warning';
  return 'stable';
}

function round(value: number): number {
  return Math.round(value);
}

export function calculateRestaurantAudit(answers: AuditAnswers): RestaurantAuditResult {
  const areaScores = AUDIT_AREAS.map((areaId) => {
    const questions = getAuditQuestionsByArea(areaId);
    const rawScore = questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
    const maxScore = questions.length * 2;
    const score = maxScore > 0 ? round((rawScore / maxScore) * 100) : 0;

    return {
      areaId,
      score,
      rawScore,
      maxScore,
      severity: getActionSeverity(score),
    };
  });

  const overallScore = round(
    areaScores.reduce((sum, area) => sum + area.score, 0) / Math.max(1, areaScores.length),
  );

  const priorityActions = [...areaScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((area) => ({
      areaId: area.areaId,
      score: area.score,
      severity: area.severity,
      actionKey: `actionPlan.actions.${area.areaId}.${area.severity}`,
    }));

  const urgentQuestionIds = AUDIT_QUESTIONS
    .filter((question) => (answers[question.id] ?? 0) === 0)
    .map((question) => question.id);

  const unknownCriticalQuestionIds = AUDIT_QUESTIONS
    .filter((question) => question.critical && (answers[question.id] ?? 0) === 0)
    .map((question) => question.id);

  return {
    areaScores,
    overallScore,
    level: getAuditLevel(overallScore),
    priorityActions,
    urgentQuestionIds,
    unknownCriticalQuestionIds,
    primeCostWarning: (answers.finance_cash_q4 ?? 0) === 0,
  };
}
