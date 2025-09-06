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
app.post('/api/auth/logout', middleware.authenticateToken, api.auth.logout);
app.get('/api/auth/verify', middleware.authenticateToken, api.auth.verifyToken);
app.put('/api/auth/profile', middleware.authenticateToken, api.auth.updateProfile);

// Rotas de integração com WhatsApp
app.get('/api/whatsapp/status', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const status = await api.whatsapp.checkInstanceStatus(userId);
  res.json(status);
});

app.post('/api/whatsapp/connect', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const result = await api.whatsapp.connectInstance(userId);
  res.json(result);
});

app.get('/api/whatsapp/qrcode', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const qrcode = await api.whatsapp.getQRCode(userId);
  res.json(qrcode);
});

app.post('/api/whatsapp/disconnect', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const result = await api.whatsapp.disconnectInstance(userId);
  res.json(result);
});

app.post('/api/whatsapp/send', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { to, message } = req.body;
  const result = await api.whatsapp.sendMessage(userId, to, message);
  res.json(result);
});

// Rotas de integração com Google Calendar
app.get('/api/google/auth-url', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const authUrl = api.googleCalendar.generateAuthUrl(userId);
  res.json({ success: true, authUrl });
});

app.post('/api/google/auth-callback', async (req, res) => {
  const { code, state } = req.body;
  const userId = state; // O state contém o ID do usuário
  
  const result = await api.googleCalendar.handleAuthCode(code, userId);
  res.json(result);
});

app.get('/api/google/status', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const status = await api.googleCalendar.checkIntegrationStatus(userId);
  res.json(status);
});

app.post('/api/google/disconnect', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const result = await api.googleCalendar.disconnectIntegration(userId);
  res.json(result);
});

app.get('/api/google/events', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { timeMin, timeMax, maxResults } = req.query;
  
  const events = await api.googleCalendar.listEvents(userId, {
    timeMin,
    timeMax,
    maxResults: maxResults ? parseInt(maxResults) : undefined
  });
  
  res.json(events);
});

app.post('/api/google/events', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const eventData = req.body;
  
  const result = await api.googleCalendar.createEvent(userId, eventData);
  res.json(result);
});

app.get('/api/google/events/:eventId', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  
  const event = await api.googleCalendar.getEvent(userId, eventId);
  res.json(event);
});

app.put('/api/google/events/:eventId', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  const eventData = req.body;
  
  const result = await api.googleCalendar.updateEvent(userId, eventId, eventData);
  res.json(result);
});

app.delete('/api/google/events/:eventId', middleware.authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  
  const result = await api.googleCalendar.deleteEvent(userId, eventId);
  res.json(result);
});

// Rotas de webhook
app.use('/api/webhooks', api.webhooks);

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