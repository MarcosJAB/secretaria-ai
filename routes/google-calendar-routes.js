/**
 * Rotas para API do Google Calendar
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const googleCalendarIntegration = require('../api/google-calendar-integration');

/**
 * @route GET /api/google-calendar/status
 * @desc Verifica o status da conexão com o Google Calendar
 * @access Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await googleCalendarIntegration.checkConnectionStatus(userId);
    
    res.json({
      success: true,
      connected: status.connected,
      message: status.message
    });
  } catch (error) {
    console.error('Erro ao verificar status do Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status da conexão com o Google Calendar'
    });
  }
});

/**
 * @route GET /api/google-calendar/auth-url
 * @desc Obtém a URL de autorização do Google
 * @access Private
 */
router.get('/auth-url', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const authUrl = await googleCalendarIntegration.generateAuthUrl(userId);
    
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar URL de autorização do Google'
    });
  }
});

/**
 * @route POST /api/google-calendar/auth-code
 * @desc Processa o código de autorização do Google
 * @access Private
 */
router.post('/auth-code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de autorização não fornecido'
      });
    }
    
    const result = await googleCalendarIntegration.handleAuthCode(code, userId);
    
    res.json({
      success: true,
      message: 'Autorização processada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar código de autorização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar código de autorização do Google'
    });
  }
});

/**
 * @route POST /api/google-calendar/disconnect
 * @desc Desconecta a conta do Google Calendar
 * @access Private
 */
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await googleCalendarIntegration.disconnect(userId);
    
    res.json({
      success: true,
      message: 'Conta do Google Calendar desconectada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar conta do Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desconectar conta do Google Calendar'
    });
  }
});

/**
 * @route GET /api/google-calendar/events
 * @desc Obtém eventos do Google Calendar
 * @access Private
 */
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeMin, timeMax, maxResults } = req.query;
    
    const events = await googleCalendarIntegration.listEvents(userId, {
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: maxResults ? parseInt(maxResults) : 10
    });
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Erro ao obter eventos do Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter eventos do Google Calendar'
    });
  }
});

/**
 * @route POST /api/google-calendar/events
 * @desc Cria um novo evento no Google Calendar
 * @access Private
 */
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventData = req.body;
    
    if (!eventData.summary || !eventData.start || !eventData.end) {
      return res.status(400).json({
        success: false,
        message: 'Dados do evento incompletos. Título, data de início e fim são obrigatórios.'
      });
    }
    
    const event = await googleCalendarIntegration.createEvent(userId, eventData);
    
    res.json({
      success: true,
      event,
      message: 'Evento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar evento no Google Calendar'
    });
  }
});

/**
 * @route PUT /api/google-calendar/events/:eventId
 * @desc Atualiza um evento existente no Google Calendar
 * @access Private
 */
router.put('/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const eventData = req.body;
    
    const event = await googleCalendarIntegration.updateEvent(userId, eventId, eventData);
    
    res.json({
      success: true,
      event,
      message: 'Evento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar evento no Google Calendar'
    });
  }
});

/**
 * @route DELETE /api/google-calendar/events/:eventId
 * @desc Remove um evento do Google Calendar
 * @access Private
 */
router.delete('/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    await googleCalendarIntegration.deleteEvent(userId, eventId);
    
    res.json({
      success: true,
      message: 'Evento removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover evento do Google Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover evento do Google Calendar'
    });
  }
});

module.exports = router;