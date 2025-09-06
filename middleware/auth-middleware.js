const jwt = require('jsonwebtoken');
const { supabase } = require('../config');

/**
 * Middleware para verificar se o usuário está autenticado
 * Verifica o token JWT no cabeçalho Authorization
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário existe no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return res.status(403).json({ error: 'Token inválido ou usuário não encontrado' });
    }
    
    // Adicionar o usuário ao objeto de requisição
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirado' });
    }
    console.error('Erro ao autenticar token:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se o token de webhook é válido
 * Verifica o token no cabeçalho X-Webhook-Secret
 */
const authenticateWebhook = (req, res, next) => {
  try {
    const webhookSecret = req.headers['x-webhook-secret'];
    
    if (!webhookSecret || webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ error: 'Acesso não autorizado ao webhook' });
    }
    
    next();
  } catch (error) {
    console.error('Erro ao autenticar webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  authenticateToken,
  authenticateWebhook
};