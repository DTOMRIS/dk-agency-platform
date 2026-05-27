export const ANALYTICS_EVENTS = {
  // AI Readiness
  AI_READINESS_STARTED: 'ai_readiness_started',
  AI_READINESS_COMPLETED: 'ai_readiness_completed',
  AI_READINESS_TOOL_CLICKED: 'ai_readiness_tool_clicked',
  AI_READINESS_KAZAN_CLICKED: 'ai_readiness_kazan_clicked',

  // Weekly Actions (P&L)
  WEEKLY_ACTIONS_SHOWN: 'weekly_actions_shown',
  WEEKLY_ACTIONS_TOOL_CLICKED: 'weekly_actions_tool_clicked',
  WEEKLY_ACTIONS_KAZAN_CLICKED: 'weekly_actions_kazan_clicked',

  // Registration
  REGISTER_STARTED: 'register_started',
  REGISTER_COMPLETED: 'register_completed',
  REGISTER_CONSENT_GIVEN: 'register_consent_given',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
