import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';

type ResponseWithTime = {
  responseTime?: number;
};

export const httpLogger = pinoHttp({
  logger,

  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} → ${res.statusCode}`;
  },

  customErrorMessage(req, res, err) {
    return `${req.method} ${req.url} → ${res.statusCode} — ${err.message}`;
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        status: res.statusCode,
      };
    },
  },

  customProps(_req, res) {
    return {
      responseTime: `${(res as ResponseWithTime).responseTime ?? 0}ms`,
    };
  },
});