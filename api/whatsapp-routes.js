const express = require('express');
const router = express.Router();
const { connectInstance, getQRCode, checkConnection, sendMessage } = require('./whatsapp-integration');
const { supabase } = require('../config');

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// Rota para iniciar conexão com o WhatsApp
router.post('/connect', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  try {
    await connectInstance(userId);
    res.json({ success: true, message: 'Conexão iniciada. Aguardando QR Code.' });
  } catch (error) {
    console.error('Erro ao iniciar conexão:', error);
    res.status(500).json({ success: false, message: 'Erro ao iniciar conexão com WhatsApp' });
  }
});

// Rota para obter QR Code
router.get('/qrcode', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const qrCode = await getQRCode(userId);
    
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR Code não disponível' });
    }
    
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter QR Code' });
  }
});

// Rota para verificar status da conexão
router.get('/status', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const status = await checkConnection(userId);
    res.json({ success: true, status });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ success: false, message: 'Erro ao verificar status da conexão' });
  }
});

// Rota para enviar mensagem
router.post('/send', authenticateUser, async (req, res) => {
  const { phone, message } = req.body;
  const userId = req.user.id;
  
  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'Telefone e mensagem são obrigatórios' });
  }
  
  try {
    const result = await sendMessage(userId, phone, message);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
  }
});

// Rota para desconectar
router.post('/disconnect', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Implementar lógica de desconexão
    res.json({ success: true, message: 'Desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ success: false, message: 'Erro ao desconectar' });
  }
});

module.exports = router;