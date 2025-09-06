/**
 * Middleware para tratamento centralizado de erros
 * Captura erros não tratados e retorna uma resposta padronizada
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  // Verificar o tipo de erro e retornar uma resposta apropriada
  if (err.name === 'ValidationError') {
    // Erro de validação (por exemplo, de um esquema Joi)
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    // Erro de autenticação
    return res.status(401).json({
      error: 'Não autorizado',
      details: err.message
    });
  }
  
  if (err.statusCode) {
    // Erro com código de status personalizado
    return res.status(err.statusCode).json({
      error: err.message || 'Erro na requisição',
      details: err.details || null
    });
  }
  
  // Erro interno do servidor (padrão)
  return res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : null
  });
};

/**
 * Middleware para capturar rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    details: `A rota ${req.method} ${req.originalUrl} não existe`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};