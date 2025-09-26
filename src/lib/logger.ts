// Secure logging utility that prevents sensitive data exposure

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  redactSensitive?: boolean;
  context?: string;
}

const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'key', 'auth', 'email', 'phone', 
  'ssn', 'credit_card', 'address', 'personal'
];

function redactSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Check if string contains sensitive patterns
    const lowerData = data.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerData.includes(field))) {
      return '[REDACTED]';
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }
  
  if (data && typeof data === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }
  
  return data;
}

function shouldLog(level: LogLevel): boolean {
  // In production, only log warnings and errors
  if (import.meta.env.PROD) {
    return level === 'warn' || level === 'error';
  }
  return true;
}

export const logger = {
  debug: (message: string, data?: any, options: LogOptions = {}) => {
    if (!shouldLog('debug')) return;
    
    const logData = options.redactSensitive !== false ? redactSensitiveData(data) : data;
    const prefix = options.context ? `[${options.context}]` : '';
    
    console.debug(`${prefix} ${message}`, logData);
  },
  
  info: (message: string, data?: any, options: LogOptions = {}) => {
    if (!shouldLog('info')) return;
    
    const logData = options.redactSensitive !== false ? redactSensitiveData(data) : data;
    const prefix = options.context ? `[${options.context}]` : '';
    
    console.info(`${prefix} ${message}`, logData);
  },
  
  warn: (message: string, data?: any, options: LogOptions = {}) => {
    if (!shouldLog('warn')) return;
    
    const logData = options.redactSensitive !== false ? redactSensitiveData(data) : data;
    const prefix = options.context ? `[${options.context}]` : '';
    
    console.warn(`${prefix} ${message}`, logData);
  },
  
  error: (message: string, error?: any, options: LogOptions = {}) => {
    if (!shouldLog('error')) return;
    
    const logData = options.redactSensitive !== false ? redactSensitiveData(error) : error;
    const prefix = options.context ? `[${options.context}]` : '';
    
    console.error(`${prefix} ${message}`, logData);
  }
};

// For backwards compatibility, but discouraged
export const secureLog = {
  // Only log non-sensitive operational info
  info: (message: string, context?: string) => {
    logger.info(message, undefined, { context });
  },
  
  // Log errors without sensitive data
  error: (message: string, error?: any, context?: string) => {
    logger.error(message, error, { context, redactSensitive: true });
  }
};