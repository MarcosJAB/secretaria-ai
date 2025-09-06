/**
 * Integração com a API do Google Calendar
 */

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('../config');

// Configurações do OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gera a URL de autorização para o Google Calendar
 * @param {string} userId - ID do usuário no Supabase
 * @returns {string} URL de autorização
 */
const generateAuthUrl = (userId) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: userId // Passa o ID do usuário como state para recuperar depois
  });
};

/**
 * Processa o código de autorização e salva os tokens
 * @param {string} code - Código de autorização
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
const handleAuthCode = async (code, userId) => {
  try {
    // Troca o código pelo token de acesso
    const { tokens } = await oauth2Client.getToken(code);
    
    // Salva os tokens no Supabase
    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expiry_date).toISOString(),
        status: 'connected'
      });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao processar código de autorização:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica e atualiza o token se necessário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Cliente autenticado ou erro
 */
const getAuthenticatedClient = async (userId) => {
  try {
    // Busca os tokens do usuário
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Integração não encontrada');
    
    // Verifica se o token expirou
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    // Configura o cliente com os tokens existentes
    oauth2Client.setCredentials({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: expiresAt.getTime()
    });
    
    // Se o token expirou, atualiza automaticamente
    if (expiresAt <= now) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Atualiza os tokens no banco
      const { error: updateError } = await supabase
        .from('integrations')
        .update({
          access_token: credentials.access_token,
          expires_at: new Date(credentials.expiry_date).toISOString()
        })
        .eq('user_id', userId)
        .eq('provider', 'google_calendar');
      
      if (updateError) throw updateError;
      
      oauth2Client.setCredentials(credentials);
    }
    
    return { success: true, client: google.calendar({ version: 'v3', auth: oauth2Client }) };
  } catch (error) {
    console.error('Erro ao autenticar cliente:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica o status da integração com o Google Calendar
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Status da integração
 */
const checkIntegrationStatus = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('status, created_at, updated_at')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();
    
    if (error) {
      // Se o erro for de registro não encontrado, retorna desconectado
      if (error.code === 'PGRST116') {
        return { success: true, status: 'disconnected' };
      }
      throw error;
    }
    
    return { success: true, status: data.status, data };
  } catch (error) {
    console.error('Erro ao verificar status da integração:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Desconecta a integração com o Google Calendar
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
const disconnectIntegration = async (userId) => {
  try {
    // Revoga o token de acesso se existir
    const { data } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();
    
    if (data && data.access_token) {
      try {
        await oauth2Client.revokeToken(data.access_token);
      } catch (revokeError) {
        console.warn('Erro ao revogar token:', revokeError);
        // Continua mesmo se falhar a revogação
      }
    }
    
    // Remove a integração do banco
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_calendar');
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao desconectar integração:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista os próximos eventos do calendário
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções de listagem
 * @returns {Promise<Object>} Lista de eventos
 */
const listEvents = async (userId, options = {}) => {
  try {
    const { success, client, error } = await getAuthenticatedClient(userId);
    if (!success) throw new Error(error);
    
    const now = new Date();
    const timeMin = options.timeMin || now.toISOString();
    const timeMax = options.timeMax || new Date(now.setDate(now.getDate() + 30)).toISOString();
    const maxResults = options.maxResults || 10;
    
    const response = await client.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return { success: true, events: response.data.items };
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cria um novo evento no calendário
 * @param {string} userId - ID do usuário
 * @param {Object} eventData - Dados do evento
 * @returns {Promise<Object>} Evento criado
 */
const createEvent = async (userId, eventData) => {
  try {
    const { success, client, error } = await getAuthenticatedClient(userId);
    if (!success) throw new Error(error);
    
    const response = await client.events.insert({
      calendarId: 'primary',
      resource: eventData
    });
    
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza um evento existente
 * @param {string} userId - ID do usuário
 * @param {string} eventId - ID do evento
 * @param {Object} eventData - Dados atualizados do evento
 * @returns {Promise<Object>} Evento atualizado
 */
const updateEvent = async (userId, eventId, eventData) => {
  try {
    const { success, client, error } = await getAuthenticatedClient(userId);
    if (!success) throw new Error(error);
    
    const response = await client.events.update({
      calendarId: 'primary',
      eventId,
      resource: eventData
    });
    
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove um evento do calendário
 * @param {string} userId - ID do usuário
 * @param {string} eventId - ID do evento
 * @returns {Promise<Object>} Resultado da operação
 */
const deleteEvent = async (userId, eventId) => {
  try {
    const { success, client, error } = await getAuthenticatedClient(userId);
    if (!success) throw new Error(error);
    
    await client.events.delete({
      calendarId: 'primary',
      eventId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca detalhes de um evento específico
 * @param {string} userId - ID do usuário
 * @param {string} eventId - ID do evento
 * @returns {Promise<Object>} Detalhes do evento
 */
const getEvent = async (userId, eventId) => {
  try {
    const { success, client, error } = await getAuthenticatedClient(userId);
    if (!success) throw new Error(error);
    
    const response = await client.events.get({
      calendarId: 'primary',
      eventId
    });
    
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateAuthUrl,
  handleAuthCode,
  checkIntegrationStatus,
  disconnectIntegration,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent
};