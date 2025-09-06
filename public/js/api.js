/**
 * Módulo para centralizar as chamadas de API no frontend
 */

const API = {
  /**
   * URL base da API
   */
  baseUrl: '/api',

  /**
   * Obtém o token JWT do localStorage
   * @returns {string|null} Token JWT ou null se não existir
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Configura os headers para as requisições autenticadas
   * @returns {Object} Headers com token de autenticação
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  /**
   * Realiza uma requisição GET
   * @param {string} endpoint - Endpoint da API
   * @param {boolean} auth - Se a requisição requer autenticação
   * @returns {Promise<Object>} Resposta da API
   */
  async get(endpoint, auth = true) {
    try {
      const headers = auth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  },

  /**
   * Realiza uma requisição POST
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {boolean} auth - Se a requisição requer autenticação
   * @returns {Promise<Object>} Resposta da API
   */
  async post(endpoint, data, auth = true) {
    try {
      const headers = auth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  },

  /**
   * Realiza uma requisição PUT
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {boolean} auth - Se a requisição requer autenticação
   * @returns {Promise<Object>} Resposta da API
   */
  async put(endpoint, data, auth = true) {
    try {
      const headers = auth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição PUT:', error);
      throw error;
    }
  },

  /**
   * Realiza uma requisição DELETE
   * @param {string} endpoint - Endpoint da API
   * @param {boolean} auth - Se a requisição requer autenticação
   * @returns {Promise<Object>} Resposta da API
   */
  async delete(endpoint, auth = true) {
    try {
      const headers = auth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição DELETE:', error);
      throw error;
    }
  },

  // Endpoints específicos

  // Autenticação
  auth: {
    /**
     * Registra um novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Resposta da API
     */
    register(userData) {
      return API.post('/auth/register', userData, false);
    },

    /**
     * Realiza login do usuário
     * @param {Object} credentials - Credenciais do usuário
     * @returns {Promise<Object>} Resposta da API com token
     */
    login(credentials) {
      return API.post('/auth/login', credentials, false);
    },

    /**
     * Realiza logout do usuário
     * @returns {Promise<Object>} Resposta da API
     */
    logout() {
      return API.post('/auth/logout', {});
    },

    /**
     * Verifica se o token é válido
     * @returns {Promise<Object>} Resposta da API
     */
    verifyToken() {
      return API.get('/auth/verify');
    },

    /**
     * Atualiza o perfil do usuário
     * @param {Object} profileData - Dados do perfil
     * @returns {Promise<Object>} Resposta da API
     */
    updateProfile(profileData) {
      return API.put('/auth/profile', profileData);
    }
  },

  // WhatsApp
  whatsapp: {
    /**
     * Verifica o status da instância do WhatsApp
     * @returns {Promise<Object>} Status da instância
     */
    checkStatus() {
      return API.get('/whatsapp/status');
    },

    /**
     * Conecta a instância do WhatsApp
     * @returns {Promise<Object>} Resultado da conexão
     */
    connect() {
      return API.post('/whatsapp/connect', {});
    },

    /**
     * Obtém o QR Code para conexão
     * @returns {Promise<Object>} QR Code
     */
    getQRCode() {
      return API.get('/whatsapp/qrcode');
    },

    /**
     * Desconecta a instância do WhatsApp
     * @returns {Promise<Object>} Resultado da desconexão
     */
    disconnect() {
      return API.post('/whatsapp/disconnect', {});
    },

    /**
     * Envia uma mensagem pelo WhatsApp
     * @param {string} to - Número de destino
     * @param {string} message - Mensagem a ser enviada
     * @returns {Promise<Object>} Resultado do envio
     */
    sendMessage(to, message) {
      return API.post('/whatsapp/send', { to, message });
    }
  },

  // Google Calendar
  googleCalendar: {
    /**
     * Obtém a URL de autorização do Google
     * @returns {Promise<Object>} URL de autorização
     */
    getAuthUrl() {
      return API.get('/google/auth-url');
    },

    /**
     * Processa o código de autorização do Google
     * @param {string} code - Código de autorização
     * @param {string} state - Estado (ID do usuário)
     * @returns {Promise<Object>} Resultado do processamento
     */
    handleAuthCode(code, state) {
      return API.post('/google/auth-callback', { code, state }, true);
    },

    /**
     * Verifica o status da integração com o Google Calendar
     * @returns {Promise<Object>} Status da integração
     */
    checkStatus() {
      return API.get('/google/status');
    },

    /**
     * Desconecta a integração com o Google Calendar
     * @returns {Promise<Object>} Resultado da desconexão
     */
    disconnect() {
      return API.post('/google/disconnect', {});
    },

    /**
     * Lista os eventos do calendário
     * @param {Object} options - Opções de listagem
     * @returns {Promise<Object>} Lista de eventos
     */
    listEvents(options = {}) {
      const queryParams = new URLSearchParams();
      if (options.timeMin) queryParams.append('timeMin', options.timeMin);
      if (options.timeMax) queryParams.append('timeMax', options.timeMax);
      if (options.maxResults) queryParams.append('maxResults', options.maxResults);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return API.get(`/google/events${query}`);
    },

    /**
     * Cria um novo evento no calendário
     * @param {Object} eventData - Dados do evento
     * @returns {Promise<Object>} Evento criado
     */
    createEvent(eventData) {
      return API.post('/google/events', eventData);
    },

    /**
     * Obtém detalhes de um evento específico
     * @param {string} eventId - ID do evento
     * @returns {Promise<Object>} Detalhes do evento
     */
    getEvent(eventId) {
      return API.get(`/google/events/${eventId}`);
    },

    /**
     * Atualiza um evento existente
     * @param {string} eventId - ID do evento
     * @param {Object} eventData - Dados atualizados do evento
     * @returns {Promise<Object>} Evento atualizado
     */
    updateEvent(eventId, eventData) {
      return API.put(`/google/events/${eventId}`, eventData);
    },

    /**
     * Remove um evento do calendário
     * @param {string} eventId - ID do evento
     * @returns {Promise<Object>} Resultado da remoção
     */
    deleteEvent(eventId) {
      return API.delete(`/google/events/${eventId}`);
    }
  }
};