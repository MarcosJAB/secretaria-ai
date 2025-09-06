/**
 * Exportação centralizada de todos os utilitários
 * Facilita a importação em outros arquivos
 */

const dateUtils = require('./date-utils');
const stringUtils = require('./string-utils');

module.exports = {
  ...dateUtils,
  ...stringUtils
};