const { google } = require('googleapis');
require('dotenv').config();

// Configuração do OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Escopos necessários para o Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

/**
 * Cria uma URL de autorização para o Google OAuth
 * @returns {Promise<string>} URL de autorização
 */
async function createAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Força a exibição da tela de consentimento para obter refresh_token
  });
  
  return authUrl;
}

/**
 * Obtém tokens a partir do código de autorização
 * @param {string} code - Código de autorização do Google
 * @returns {Promise<Object>} Dados do token
 */
async function getTokenFromCode(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Erro ao obter tokens:', error);
    throw error;
  }
}

/**
 * Configura o cliente OAuth2 com os tokens fornecidos
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 */
function setupOAuth2Client(accessToken, refreshToken) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  
  return oauth2Client;
}

/**
 * Obtém eventos do Google Calendar
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 * @param {Object} options - Opções adicionais (timeMin, timeMax, maxResults)
 * @returns {Promise<Array>} Lista de eventos
 */
async function getEvents(accessToken, refreshToken, options = {}) {
  try {
    const auth = setupOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const timeMin = options.timeMin || new Date().toISOString();
    const timeMax = options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const maxResults = options.maxResults || 10;
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    throw error;
  }
}

/**
 * Cria um evento no Google Calendar
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 * @param {Object} eventData - Dados do evento a ser criado
 * @returns {Promise<Object>} Evento criado
 */
async function createEvent(accessToken, refreshToken, eventData) {
  try {
    const auth = setupOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventData,
      sendUpdates: 'all', // Envia notificações por email
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
}

/**
 * Atualiza um evento no Google Calendar
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 * @param {string} eventId - ID do evento a ser atualizado
 * @param {Object} eventData - Dados atualizados do evento
 * @returns {Promise<Object>} Evento atualizado
 */
async function updateEvent(accessToken, refreshToken, eventId, eventData) {
  try {
    const auth = setupOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: eventData,
      sendUpdates: 'all', // Envia notificações por email
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    throw error;
  }
}

/**
 * Exclui um evento do Google Calendar
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 * @param {string} eventId - ID do evento a ser excluído
 * @returns {Promise<void>}
 */
async function deleteEvent(accessToken, refreshToken, eventId) {
  try {
    const auth = setupOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Envia notificações por email
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    throw error;
  }
}

/**
 * Verifica se a integração com o Google Calendar está ativa
 * @param {string} accessToken - Token de acesso
 * @param {string} refreshToken - Token de atualização
 * @returns {Promise<boolean>} Status da integração
 */
async function checkIntegrationStatus(accessToken, refreshToken) {
  try {
    const auth = setupOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Tenta obter a lista de calendários para verificar se a autenticação está funcionando
    await calendar.calendarList.list({ maxResults: 1 });
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar status da integração:', error);
    return false;
  }
}

module.exports = {
  createAuthUrl,
  getTokenFromCode,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkIntegrationStatus
};