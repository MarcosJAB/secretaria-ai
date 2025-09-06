/**
 * Exportação centralizada de rotas
 */

const whatsappRoutes = require('./whatsapp-routes');
const googleCalendarRoutes = require('./google-calendar-routes');
const webhookRoutes = require('./webhook-routes');

module.exports = {
  whatsappRoutes,
  googleCalendarRoutes,
  webhookRoutes
};