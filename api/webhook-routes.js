const express = require('express');
const router = express.Router();
const { supabase } = require('../config');

// Middleware de autenticação para webhooks
const authenticateWebhook = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ success: false, message: 'Acesso não autorizado' });
  }
  
  next();
};

// Rota para receber eventos do WhatsApp
router.post('/whatsapp', authenticateWebhook, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }
    
    // Registrar evento no banco de dados
    await supabase
      .from('webhook_events')
      .insert({
        type: 'whatsapp',
        event_name: event,
        payload: data,
        processed: false,
        created_at: new Date().toISOString()
      });
    
    // Processar evento conforme necessário
    // Implementar lógica específica para cada tipo de evento
    
    res.json({ success: true, message: 'Evento recebido com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook do WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar evento' });
  }
});

// Rota para receber eventos do Google Calendar
router.post('/google-calendar', authenticateWebhook, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }
    
    // Registrar evento no banco de dados
    await supabase
      .from('webhook_events')
      .insert({
        type: 'google_calendar',
        event_name: event,
        payload: data,
        processed: false,
        created_at: new Date().toISOString()
      });
    
    // Processar evento conforme necessário
    // Implementar lógica específica para cada tipo de evento
    
    res.json({ success: true, message: 'Evento recebido com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook do Google Calendar:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar evento' });
  }
});

// Rota para receber eventos do n8n
router.post('/n8n', authenticateWebhook, async (req, res) => {
  try {
    const { action, data } = req.body;
    
    if (!action || !data) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }
    
    // Processar diferentes ações do n8n
    switch (action) {
      case 'send_whatsapp':
        // Implementar lógica para enviar mensagem no WhatsApp
        // Esta lógica pode chamar a API interna de WhatsApp
        break;
        
      case 'create_calendar_event':
        // Implementar lógica para criar evento no Google Calendar
        // Esta lógica pode chamar a API interna do Google Calendar
        break;
        
      default:
        return res.status(400).json({ success: false, message: 'Ação desconhecida' });
    }
    
    // Registrar evento no banco de dados
    await supabase
      .from('webhook_events')
      .insert({
        type: 'n8n',
        event_name: action,
        payload: data,
        processed: true,
        created_at: new Date().toISOString()
      });
    
    res.json({ success: true, message: 'Ação processada com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook do n8n:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar ação' });
  }
});

module.exports = router;