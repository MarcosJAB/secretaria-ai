const axios = require('axios');
const { supabase } = require('../config');

// Configurações da Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Armazenamento temporário de QR Codes
const qrCodes = {};

// Função para criar uma instância do WhatsApp
async function connectInstance(userId) {
  try {
    // Verificar se já existe uma instância para este usuário
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'whatsapp');

    let instanceName;
    
    if (error) throw error;
    
    if (integrations && integrations.length > 0) {
      instanceName = integrations[0].instance_name;
    } else {
      // Criar um nome de instância único baseado no ID do usuário
      instanceName = `user_${userId}_${Date.now()}`;
      
      // Registrar a nova instância no banco de dados
      await supabase
        .from('integrations')
        .insert({
          user_id: userId,
          type: 'whatsapp',
          instance_name: instanceName,
          status: 'connecting',
          created_at: new Date().toISOString()
        });
    }

    // Criar ou reconectar a instância na Evolution API
    const response = await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
      instanceName,
      token: EVOLUTION_API_KEY,
      qrcode: true
    });

    // Iniciar o processo de monitoramento do QR Code
    startQRCodeMonitoring(instanceName, userId);

    return response.data;
  } catch (error) {
    console.error('Erro ao conectar instância do WhatsApp:', error);
    throw error;
  }
}

// Função para monitorar e obter o QR Code
async function startQRCodeMonitoring(instanceName, userId) {
  try {
    // Configurar polling para obter o QR Code
    const checkQRCode = async () => {
      try {
        const response = await axios.get(
          `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
          { headers: { 'apikey': EVOLUTION_API_KEY } }
        );

        const state = response.data.state;
        
        // Atualizar status no banco de dados
        await supabase
          .from('integrations')
          .update({ status: state })
          .eq('user_id', userId)
          .eq('type', 'whatsapp');

        if (state === 'connecting') {
          // Obter QR Code
          const qrResponse = await axios.get(
            `${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`,
            { headers: { 'apikey': EVOLUTION_API_KEY } }
          );

          if (qrResponse.data && qrResponse.data.qrcode) {
            // Armazenar QR Code temporariamente
            qrCodes[userId] = qrResponse.data.qrcode;
          }

          // Continuar verificando se ainda estiver conectando
          setTimeout(checkQRCode, 5000);
        } else if (state === 'connected') {
          // Limpar QR Code quando conectado
          delete qrCodes[userId];
        }
      } catch (error) {
        console.error('Erro ao monitorar QR Code:', error);
        setTimeout(checkQRCode, 10000); // Tentar novamente após erro
      }
    };

    // Iniciar o processo de verificação
    checkQRCode();
  } catch (error) {
    console.error('Erro ao iniciar monitoramento de QR Code:', error);
    throw error;
  }
}

// Função para obter o QR Code
async function getQRCode(userId) {
  return qrCodes[userId] || null;
}

// Função para verificar o status da conexão
async function checkConnection(userId) {
  try {
    // Obter informações da instância do banco de dados
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'whatsapp');

    if (error) throw error;
    
    if (!integrations || integrations.length === 0) {
      return { connected: false, status: 'not_initialized' };
    }

    const instanceName = integrations[0].instance_name;
    const status = integrations[0].status;

    // Verificar status atual na Evolution API
    const response = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      { headers: { 'apikey': EVOLUTION_API_KEY } }
    );

    const currentState = response.data.state;
    
    // Atualizar status no banco de dados se for diferente
    if (currentState !== status) {
      await supabase
        .from('integrations')
        .update({ status: currentState })
        .eq('user_id', userId)
        .eq('type', 'whatsapp');
    }

    return { 
      connected: currentState === 'connected', 
      status: currentState 
    };
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return { connected: false, status: 'error', error: error.message };
  }
}

// Função para enviar mensagem
async function sendMessage(userId, phone, message) {
  try {
    // Obter informações da instância do banco de dados
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'whatsapp');

    if (error) throw error;
    
    if (!integrations || integrations.length === 0) {
      throw new Error('Instância do WhatsApp não encontrada');
    }

    const instanceName = integrations[0].instance_name;
    
    // Formatar número de telefone (remover caracteres não numéricos)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Enviar mensagem via Evolution API
    const response = await axios.post(
      `${EVOLUTION_API_URL}/message/text/${instanceName}`,
      {
        number: formattedPhone,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text: message
        }
      },
      { headers: { 'apikey': EVOLUTION_API_KEY } }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

module.exports = {
  connectInstance,
  getQRCode,
  checkConnection,
  sendMessage
};