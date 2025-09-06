/**
 * Servidor principal da aplicação
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importações de APIs e middlewares
const api = require('./api');
const middleware = require('./middleware');
const routes = require('./routes');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware.logger);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas de API

// Rotas de autenticação
app.post('/api/auth/register', api.auth.register);
app.post('/api/auth/login', api.auth.login);
app.post('/api/auth/logout', middleware.authenticateUser, api.auth.logout);
app.get('/api/auth/verify', middleware.authenticateUser, api.auth.verifyToken);
app.put('/api/auth/profile', middleware.authenticateUser, api.auth.updateProfile);

// Rotas de integração com WhatsApp
app.use('/api/whatsapp', routes.whatsappRoutes);

// Rotas de integração com Google Calendar
app.use('/api/google', routes.googleCalendarRoutes);

// Rotas de webhook
app.use('/api/webhooks', routes.webhookRoutes);

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Middleware para rotas não encontradas
app.use(middleware.notFoundHandler);

// Middleware de tratamento de erros
app.use(middleware.errorLogger);
app.use(middleware.errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;