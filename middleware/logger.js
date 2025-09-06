/**
 * Middleware para registro de logs de requisições HTTP
 * Registra informações sobre cada requisição recebida pelo servidor
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Registrar informações da requisição
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - IP: ${ip}`);
  
  // Capturar quando a resposta for enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Determinar o nível de log com base no código de status
    let logLevel = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      logLevel = 'warn';
    } else if (statusCode >= 500) {
      logLevel = 'error';
    }
    
    // Registrar informações da resposta
    console[logLevel](
      `[${new Date().toISOString()}] ${method} ${originalUrl} - Status: ${statusCode} - Duração: ${duration}ms`
    );
  });
  
  next();
};

/**
 * Middleware para registro de logs de erros
 * Registra informações detalhadas sobre erros ocorridos durante o processamento de requisições
 */
const errorLogger = (err, req, res, next) => {
  const { method, originalUrl, ip, body, query, params } = req;
  
  // Registrar informações detalhadas do erro
  console.error(`[${new Date().toISOString()}] ERRO: ${method} ${originalUrl} - IP: ${ip}`);
  console.error('Mensagem de erro:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Registrar dados da requisição (com cuidado para não logar informações sensíveis)
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
  
  console.error('Dados da requisição:', {
    body: sanitizedBody,
    query,
    params
  });
  
  next(err);
};

module.exports = {
  logger,
  errorLogger
};