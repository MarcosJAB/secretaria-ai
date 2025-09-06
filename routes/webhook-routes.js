/**
 * Rotas para webhooks
 */

const express = require('express');
const router = express.Router();
const { authenticateWebhook } = require('../middleware');

/**
 * @route POST /api/webhooks/whatsapp
 * @desc Webhook para receber eventos do WhatsApp
 * @access Private (via token de webhook)
 */
router.post('/whatsapp', authenticateWebhook, async (req, res) => {
  try {
    const eventData = req.body;
    
    // Registra o evento recebido
    console.log('Webhook WhatsApp recebido:', JSON.stringify(eventData));
    
    // Aqui você pode processar o evento conforme necessário
    // Por exemplo, encaminhar para o n8n ou outro serviço
    
    // Responde com sucesso
    res.status(200).json({
      success: true,
      message: 'Evento processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook do WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook'
    });
  }
});

/**
 * @route POST /api/webhooks/calendar
 * @desc Webhook para receber eventos do Google Calendar
 * @access Private (via token de webhook)
 */
router.post('/calendar', authenticateWebhook, async (req, res) => {
  try {
    const eventData = req.body;
    
    // Registra o evento recebido
    console.log('Webhook Calendar recebido:', JSON.stringify(eventData));
    
    // Aqui você pode processar o evento conforme necessário
    // Por exemplo, encaminhar para o n8n ou outro serviço
    
    // Responde com sucesso
    res.status(200).json({
      success: true,
      message: 'Evento processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook do Calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook'
    });
  }
});

/**
 * @route POST /api/webhooks/n8n
 * @desc Webhook para receber eventos do n8n
 * @access Private (via token de webhook)
 */
router.post('/n8n', authenticateWebhook, async (req, res) => {
  try {
    const eventData = req.body;
    
    // Registra o evento recebido
    console.log('Webhook n8n recebido:', JSON.stringify(eventData));
    
    // Aqui você pode processar o evento conforme necessário
    // Por exemplo, enviar uma mensagem pelo WhatsApp ou criar um evento no Google Calendar
    
    // Responde com sucesso
    res.status(200).json({
      success: true,
      message: 'Evento processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook do n8n:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook'
    });
  }
});

/**
 * @route GET /api/webhooks/test
 * @desc Rota para testar se os webhooks estão funcionando
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de webhooks está funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;