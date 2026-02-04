/**
 * Logger Utility
 * Simple production-ready logger
 */

const config = require('../config/config');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[config.logLevel] || levels.info;

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const color = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.green,
    debug: colors.cyan,
  }[level] || colors.reset;
  
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2);
    }
    return arg;
  }).join(' ');
  
  return `${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message} ${formattedArgs}`;
}

const logger = {
  error: (message, ...args) => {
    if (currentLevel >= levels.error) {
      console.error(formatMessage('error', message, ...args));
    }
  },
  
  warn: (message, ...args) => {
    if (currentLevel >= levels.warn) {
      console.warn(formatMessage('warn', message, ...args));
    }
  },
  
  info: (message, ...args) => {
    if (currentLevel >= levels.info) {
      console.log(formatMessage('info', message, ...args));
    }
  },
  
  debug: (message, ...args) => {
    if (currentLevel >= levels.debug) {
      console.log(formatMessage('debug', message, ...args));
    }
  },
};

module.exports = logger;
