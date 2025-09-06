/**
 * Middlewares centralizados
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar usuários via JWT
 */
const authenticateUser = (req, res, next) => {
  try {
    // Obtém o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adiciona o usuário decodificado à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

/**
 * Middleware para autenticar webhooks via token secreto
 */
const authenticateWebhook = (req, res, next) => {
  try {
    // Obtém o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de webhook não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifica se o token corresponde ao segredo do webhook
    if (token !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        message: 'Token de webhook inválido'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro de autenticação de webhook:', error);
    return res.status(401).json({
      success: false,
      message: 'Erro ao autenticar webhook'
    });
  }
};

module.exports = {
  authenticateUser,
  authenticateWebhook
};