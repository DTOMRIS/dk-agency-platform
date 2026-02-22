// lib/logs.ts
// DK Agency - User Activity Logging System
// Structured logging for user actions, system events, and analytics

// Log Levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Log Categories
export enum LogCategory {
  AUTH = 'AUTH',
  USER_ACTION = 'USER_ACTION',
  SYSTEM = 'SYSTEM',
  API = 'API',
  LISTING = 'LISTING',
  PAYMENT = 'PAYMENT',
  PARTNER = 'PARTNER',
  AI = 'AI',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
}

// Log Entry Interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
}

// In-memory log store (replace with actual database/log service in production)
const logStore: LogEntry[] = [];
const MAX_LOGS = 10000;

// Generate unique log ID
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Core logging function
export function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  options?: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'level' | 'category' | 'message'>>
): LogEntry {
  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    ...options,
  };

  // Store log
  logStore.push(entry);
  
  // Trim if exceeds max
  if (logStore.length > MAX_LOGS) {
    logStore.shift();
  }

  // Console output (in development)
  if (process.env.NODE_ENV === 'development') {
    const color = getLogColor(level);
    console.log(
      `${color}[${entry.timestamp}] [${level}] [${category}]${'\x1b[0m'} ${message}`,
      options?.metadata ? options.metadata : ''
    );
  }

  // TODO: In production, send to logging service (e.g., CloudWatch, DataDog, etc.)
  // sendToLoggingService(entry);

  return entry;
}

// Get ANSI color for log level
function getLogColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
    case LogLevel.INFO: return '\x1b[32m';  // Green
    case LogLevel.WARN: return '\x1b[33m';  // Yellow
    case LogLevel.ERROR: return '\x1b[31m'; // Red
    case LogLevel.FATAL: return '\x1b[35m'; // Magenta
    default: return '\x1b[0m';
  }
}

// Convenience logging functions

export function logDebug(category: LogCategory, message: string, options?: Partial<LogEntry>) {
  return log(LogLevel.DEBUG, category, message, options);
}

export function logInfo(category: LogCategory, message: string, options?: Partial<LogEntry>) {
  return log(LogLevel.INFO, category, message, options);
}

export function logWarn(category: LogCategory, message: string, options?: Partial<LogEntry>) {
  return log(LogLevel.WARN, category, message, options);
}

export function logError(category: LogCategory, message: string, options?: Partial<LogEntry>) {
  return log(LogLevel.ERROR, category, message, options);
}

export function logFatal(category: LogCategory, message: string, options?: Partial<LogEntry>) {
  return log(LogLevel.FATAL, category, message, options);
}

// User Activity Tracking

export function trackUserLogin(userId: string, metadata?: Record<string, unknown>) {
  return logInfo(LogCategory.AUTH, `User logged in: ${userId}`, {
    userId,
    action: 'LOGIN',
    success: true,
    metadata,
  });
}

export function trackUserLogout(userId: string) {
  return logInfo(LogCategory.AUTH, `User logged out: ${userId}`, {
    userId,
    action: 'LOGOUT',
    success: true,
  });
}

export function trackUserAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
) {
  return logInfo(LogCategory.USER_ACTION, `User ${userId} performed ${action} on ${resource}`, {
    userId,
    action,
    resource,
    resourceId,
    metadata,
  });
}

export function trackPageView(
  userId: string | undefined,
  page: string,
  metadata?: Record<string, unknown>
) {
  return logInfo(LogCategory.USER_ACTION, `Page view: ${page}`, {
    userId,
    action: 'PAGE_VIEW',
    resource: page,
    metadata,
  });
}

// Listing Activity

export function trackListingCreated(userId: string, listingId: string, category: string) {
  return logInfo(LogCategory.LISTING, `Listing created: ${listingId}`, {
    userId,
    action: 'CREATE',
    resource: 'listing',
    resourceId: listingId,
    metadata: { category },
  });
}

export function trackListingViewed(listingId: string, viewerId?: string) {
  return logInfo(LogCategory.LISTING, `Listing viewed: ${listingId}`, {
    userId: viewerId,
    action: 'VIEW',
    resource: 'listing',
    resourceId: listingId,
  });
}

export function trackListingUpdated(userId: string, listingId: string, changes: string[]) {
  return logInfo(LogCategory.LISTING, `Listing updated: ${listingId}`, {
    userId,
    action: 'UPDATE',
    resource: 'listing',
    resourceId: listingId,
    metadata: { changes },
  });
}

// AI Activity

export function trackAIRequest(
  userId: string,
  requestType: string,
  targetAgent: string,
  duration?: number,
  success?: boolean
) {
  return logInfo(LogCategory.AI, `AI request: ${requestType} to ${targetAgent}`, {
    userId,
    action: requestType,
    resource: 'ai_agent',
    resourceId: targetAgent,
    duration,
    success,
  });
}

// Partner Activity

export function trackPartnerActivity(
  partnerId: string,
  action: string,
  details?: Record<string, unknown>
) {
  return logInfo(LogCategory.PARTNER, `Partner activity: ${action}`, {
    userId: partnerId,
    action,
    resource: 'partner',
    resourceId: partnerId,
    metadata: details,
  });
}

// Security Events

export function trackSecurityEvent(
  eventType: string,
  details: Record<string, unknown>,
  severity: LogLevel = LogLevel.WARN
) {
  return log(severity, LogCategory.SECURITY, `Security event: ${eventType}`, {
    action: eventType,
    metadata: details,
  });
}

export function trackFailedLogin(email: string, ipAddress?: string, reason?: string) {
  return logWarn(LogCategory.SECURITY, `Failed login attempt: ${email}`, {
    action: 'FAILED_LOGIN',
    metadata: { email, reason },
    ipAddress,
    success: false,
  });
}

export function trackSuspiciousActivity(
  description: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  return logWarn(LogCategory.SECURITY, `Suspicious activity: ${description}`, {
    userId,
    action: 'SUSPICIOUS_ACTIVITY',
    metadata,
  });
}

// API Tracking

export function trackAPICall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
  
  return log(level, LogCategory.API, `API ${method} ${endpoint} - ${statusCode}`, {
    userId,
    action: method,
    resource: endpoint,
    duration,
    success: statusCode < 400,
    metadata: { statusCode },
  });
}

// Performance Tracking

export function trackPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
) {
  const level = duration > 5000 ? LogLevel.WARN : duration > 10000 ? LogLevel.ERROR : LogLevel.INFO;
  
  return log(level, LogCategory.PERFORMANCE, `Performance: ${operation} took ${duration}ms`, {
    action: operation,
    duration,
    metadata,
  });
}

// Query Logs

export function getLogs(options?: {
  level?: LogLevel;
  category?: LogCategory;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): LogEntry[] {
  let filtered = [...logStore];

  if (options?.level) {
    filtered = filtered.filter(log => log.level === options.level);
  }

  if (options?.category) {
    filtered = filtered.filter(log => log.category === options.category);
  }

  if (options?.userId) {
    filtered = filtered.filter(log => log.userId === options.userId);
  }

  if (options?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= options.startDate!);
  }

  if (options?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= options.endDate!);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

// Get logs summary for dashboard
export function getLogsSummary(hours: number = 24): {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  errorRate: number;
  recentErrors: LogEntry[];
} {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const recentLogs = logStore.filter(log => log.timestamp >= cutoffTime);

  const byLevel: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  recentLogs.forEach(log => {
    byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    byCategory[log.category] = (byCategory[log.category] || 0) + 1;
  });

  const errorCount = (byLevel[LogLevel.ERROR] || 0) + (byLevel[LogLevel.FATAL] || 0);
  const errorRate = recentLogs.length > 0 ? (errorCount / recentLogs.length) * 100 : 0;

  const recentErrors = recentLogs
    .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL)
    .slice(0, 10);

  return {
    total: recentLogs.length,
    byLevel,
    byCategory,
    errorRate,
    recentErrors,
  };
}

// Clear logs (for testing or maintenance)
export function clearLogs() {
  logStore.length = 0;
}

// Export log store for debugging (only in development)
export function getLogStore(): LogEntry[] {
  if (process.env.NODE_ENV === 'development') {
    return [...logStore];
  }
  return [];
}
