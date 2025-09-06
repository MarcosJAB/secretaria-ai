/**
 * Módulo de integração com a API do WhatsApp (Evolution API)
 */

const axios = require('axios');
const { createHmac } = require('crypto');

/**
 * Configuração da API do WhatsApp
 */
const whatsappConfig = {
  baseUrl: process.env.WHATSAPP_API_URL,
  apiKey: process.env.WHATSAPP_API_KEY,
  instanceName: process.env.WHATSAPP_INSTANCE || 'secretaria-ai',
  webhookUrl: process.env.WEBHOOK_URL,
  webhookSecret: process.env.WEBHOOK_SECRET
};

/**
 * Verifica se a configuração do WhatsApp está completa
 * @returns {boolean} Verdadeiro se a configuração estiver completa
 */
const isConfigured = () => {
  return !!whatsappConfig.baseUrl && !!whatsappConfig.apiKey;
};

/**
 * Cria o cliente Axios com a configuração base
 * @returns {Object} Cliente Axios configurado
 */
const createClient = () => {
  if (!isConfigured()) {
    throw new Error('Configuração do WhatsApp incompleta');
  }

  return axios.create({
    baseURL: whatsappConfig.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'apikey': whatsappConfig.apiKey
    }
  });
};

/**
 * Verifica o status da instância do WhatsApp
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Status da instância
 */
const checkStatus = async (userId) => {
  try {
    const client = createClient();
    const response = await client.get(`/instance/connectionState/${whatsappConfig.instanceName}`);
    
    return {
      success: true,
      connected: response.data.state === 'open',
      state: response.data.state,
      userId
    };
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error.message);
    
    // Se o erro for 404, a instância não existe
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        connected: false,
        state: 'not_initialized',
        message: 'Instância não inicializada',
        userId
      };
    }
    
    return {
      success: false,
      connected: false,
      state: 'error',
      message: error.message,
      userId
    };
  }
};

/**
 * Inicializa a instância do WhatsApp
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da inicialização
 */
const initializeInstance = async (userId) => {
  try {
    const client = createClient();
    
    // Verifica se a instância já existe
    try {
      const statusResponse = await client.get(`/instance/connectionState/${whatsappConfig.instanceName}`);
      if (statusResponse.data && statusResponse.data.state) {
        return {
          success: true,
          message: 'Instância já inicializada',
          state: statusResponse.data.state,
          userId
        };
      }
    } catch (statusError) {
      // Se der erro 404, a instância não existe e precisamos criar
      if (!(statusError.response && statusError.response.status === 404)) {
        throw statusError;
      }
    }
    
    // Cria a instância
    const response = await client.post('/instance/create', {
      instanceName: whatsappConfig.instanceName,
      webhook: whatsappConfig.webhookUrl ? {
        url: whatsappConfig.webhookUrl,
        secret: whatsappConfig.webhookSecret || ''
      } : null,
      webhookByEvents: true
    });
    
    return {
      success: true,
      message: 'Instância inicializada com sucesso',
      data: response.data,
      userId
    };
  } catch (error) {
    console.error('Erro ao inicializar instância do WhatsApp:', error.message);
    return {
      success: false,
      message: `Erro ao inicializar instância: ${error.message}`,
      userId
    };
  }
};

/**
 * Obtém o QR Code para conexão
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} QR Code
 */
const getQRCode = async (userId) => {
  try {
    const client = createClient();
    
    // Verifica o status atual
    const statusResponse = await checkStatus(userId);
    
    // Se já estiver conectado, retorna erro
    if (statusResponse.connected) {
      return {
        success: false,
        message: 'WhatsApp já está conectado',
        userId
      };
    }
    
    // Se a instância não estiver inicializada, inicializa
    if (statusResponse.state === 'not_initialized') {
      await initializeInstance(userId);
    }
    
    // Gera o QR Code
    const response = await client.post(`/instance/qrcode/${whatsappConfig.instanceName}`);
    
    if (response.data && response.data.qrcode) {
      return {
        success: true,
        qrcode: response.data.qrcode,
        userId
      };
    } else {
      throw new Error('QR Code não disponível');
    }
  } catch (error) {
    console.error('Erro ao obter QR Code:', error.message);
    return {
      success: false,
      message: `Erro ao obter QR Code: ${error.message}`,
      userId
    };
  }
};

/**
 * Desconecta a instância do WhatsApp
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da desconexão
 */
const disconnect = async (userId) => {
  try {
    const client = createClient();
    
    // Verifica se está conectado
    const statusResponse = await checkStatus(userId);
    if (!statusResponse.connected) {
      return {
        success: false,
        message: 'WhatsApp não está conectado',
        userId
      };
    }
    
    // Desconecta
    const response = await client.delete(`/instance/logout/${whatsappConfig.instanceName}`);
    
    return {
      success: true,
      message: 'WhatsApp desconectado com sucesso',
      data: response.data,
      userId
    };
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error.message);
    return {
      success: false,
      message: `Erro ao desconectar: ${error.message}`,
      userId
    };
  }
};

/**
 * Envia uma mensagem pelo WhatsApp
 * @param {string} to - Número de destino (formato: 5511999999999)
 * @param {string} message - Mensagem a ser enviada
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado do envio
 */
const sendMessage = async (to, message, userId) => {
  try {
    const client = createClient();
    
    // Verifica se está conectado
    const statusResponse = await checkStatus(userId);
    if (!statusResponse.connected) {
      return {
        success: false,
        message: 'WhatsApp não está conectado',
        userId
      };
    }
    
    // Formata o número (remove caracteres não numéricos)
    const formattedNumber = to.replace(/\D/g, '');
    
    // Envia a mensagem
    const response = await client.post(`/message/text/${whatsappConfig.instanceName}`, {
      number: formattedNumber,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: message
      }
    });
    
    return {
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: response.data,
      userId
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    return {
      success: false,
      message: `Erro ao enviar mensagem: ${error.message}`,
      userId
    };
  }
};

/**
 * Verifica a assinatura do webhook
 * @param {string} signature - Assinatura do webhook
 * @param {string} body - Corpo da requisição
 * @returns {boolean} Verdadeiro se a assinatura for válida
 */
const verifyWebhookSignature = (signature, body) => {
  if (!whatsappConfig.webhookSecret) return true; // Se não tiver segredo, não valida
  
  try {
    const hmac = createHmac('sha256', whatsappConfig.webhookSecret);
    const digest = hmac.update(JSON.stringify(body)).digest('hex');
    
    return signature === digest;
  } catch (error) {
    console.error('Erro ao verificar assinatura do webhook:', error.message);
    return false;
  }
};

/**
 * Processa eventos do webhook
 * @param {Object} event - Evento recebido
 * @returns {Promise<Object>} Resultado do processamento
 */
const processWebhookEvent = async (event) => {
  try {
    // Aqui você pode implementar a lógica para processar diferentes tipos de eventos
    // Por exemplo, mensagens recebidas, status de mensagens, etc.
    
    console.log('Evento do WhatsApp recebido:', event.type);
    
    // Exemplo de processamento de mensagem recebida
    if (event.type === 'message' && event.body && event.from) {
      // Aqui você pode implementar a lógica para responder automaticamente
      // ou encaminhar a mensagem para outro sistema
      
      console.log(`Mensagem recebida de ${event.from}: ${event.body}`);
      
      // Exemplo: responder automaticamente
      // await sendMessage(event.from, 'Recebi sua mensagem e logo responderei!', 'system');
    }
    
    return {
      success: true,
      message: 'Evento processado com sucesso',
      eventType: event.type
    };
  } catch (error) {
    console.error('Erro ao processar evento do webhook:', error.message);
    return {
      success: false,
      message: `Erro ao processar evento: ${error.message}`
    };
  }
};

module.exports = {
  checkStatus,
  initializeInstance,
  getQRCode,
  disconnect,
  sendMessage,
  verifyWebhookSignature,
  processWebhookEvent,
  isConfigured
};