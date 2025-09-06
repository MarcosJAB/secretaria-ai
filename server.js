require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importação das rotas
const whatsappRoutes = require('./api/whatsapp-routes');
const googleCalendarRoutes = require('./api/google-calendar-routes');
const webhookRoutes = require('./api/webhook-routes');

// Configuração do servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '/')));

// Rotas da API
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/webhook', webhookRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota de callback do Google OAuth
app.get('/google/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'google-oauth-callback.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Servidor HTTP de compatibilidade para webhooks
const http = require('http');
const httpServer = http.createServer(app);
const HTTP_PORT = 30001;

httpServer.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP de compatibilidade rodando em http://localhost:${HTTP_PORT}`);
});

// Carregar módulos de integração
console.log('Carregando módulos de integração...');
require('./api/whatsapp-integration');
require('./api/google-calendar-integration');
console.log('Módulos de integração carregados com sucesso!');
