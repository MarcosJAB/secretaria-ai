/**
 * Exportação centralizada de todas as APIs
 * Facilita a importação em outros arquivos
 */

const whatsappIntegration = require('./whatsapp-integration');
const googleCalendarIntegration = require('./google-calendar-integration');
const auth = require('./auth');

module.exports = {
  whatsapp: whatsappIntegration,
  googleCalendar: googleCalendarIntegration,
  auth
};