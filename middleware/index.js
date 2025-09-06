/**
 * Exportação centralizada de todos os middlewares
 * Facilita a importação em outros arquivos
 */

const { authenticateToken, authenticateWebhook } = require('./auth-middleware');
const { errorHandler, notFoundHandler } = require('./error-handler');
const { logger, errorLogger } = require('./logger');

module.exports = {
  authenticateToken,
  authenticateWebhook,
  errorHandler,
  notFoundHandler,
  logger,
  errorLogger
};