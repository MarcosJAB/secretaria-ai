/**
 * Rotas para a API do WhatsApp
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateWebhook } = require('../middleware');
const whatsappIntegration = require('../api/whatsapp-integration');

/**
 * @route GET /api/whatsapp/status
 * @desc Verifica o status da conexão com o WhatsApp
 * @access Privado
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await whatsappIntegration.checkStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao verificar status: ${error.message}`
    });
  }
});

/**
 * @route POST /api/whatsapp/connect
 * @desc Inicializa a instância do WhatsApp
 * @access Privado
 */
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await whatsappIntegration.initializeInstance(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao inicializar instância do WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao inicializar instância: ${error.message}`
    });
  }
});

/**
 * @route GET /api/whatsapp/qrcode
 * @desc Obtém o QR Code para conexão
 * @access Privado
 */
router.get('/qrcode', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await whatsappIntegration.getQRCode(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao obter QR Code: ${error.message}`
    });
  }
});

/**
 * @route POST /api/whatsapp/disconnect
 * @desc Desconecta a instância do WhatsApp
 * @access Privado
 */
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await whatsappIntegration.disconnect(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao desconectar: ${error.message}`
    });
  }
});

/**
 * @route POST /api/whatsapp/send
 * @desc Envia uma mensagem pelo WhatsApp
 * @access Privado
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, message } = req.body;
    const userId = req.user.id;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número de destino e mensagem são obrigatórios'
      });
    }
    
    const result = await whatsappIntegration.sendMessage(to, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao enviar mensagem: ${error.message}`
    });
  }
});

/**
 * @route POST /api/whatsapp/webhook
 * @desc Recebe eventos do webhook do WhatsApp
 * @access Público (com verificação de assinatura)
 */
router.post('/webhook', authenticateWebhook, async (req, res) => {
  try {
    const event = req.body;
    
    // Verifica a assinatura do webhook (se configurada)
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'] || '';
    
    if (!whatsappIntegration.verifyWebhookSignature(signature, event)) {
      return res.status(401).json({
        success: false,
        message: 'Assinatura do webhook inválida'
      });
    }
    
    // Processa o evento de forma assíncrona
    whatsappIntegration.processWebhookEvent(event)
      .then(result => {
        console.log('Evento do webhook processado:', result);
      })
      .catch(error => {
        console.error('Erro ao processar evento do webhook:', error);
      });
    
    // Responde imediatamente para não bloquear o webhook
    res.status(200).json({ success: true, message: 'Evento recebido' });
  } catch (error) {
    console.error('Erro no webhook do WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: `Erro no webhook: ${error.message}`
    });
  }
});

module.exports = router;