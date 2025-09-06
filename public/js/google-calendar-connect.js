/**
 * Módulo para gerenciar a conexão com o Google Calendar
 */

const GoogleCalendarConnect = {
  /**
   * Elemento que exibirá o status da conexão
   */
  statusElement: null,
  
  /**
   * Intervalo de verificação do status
   */
  statusCheckInterval: null,
  
  /**
   * Inicializa o módulo
   * @param {string} statusElementId - ID do elemento para exibir o status
   */
  init(statusElementId) {
    this.statusElement = document.getElementById(statusElementId);
    
    if (!this.statusElement) {
      console.error('Elemento de status não encontrado');
      return;
    }
    
    // Verifica o status inicial
    this.checkStatus();
    
    // Configura verificação periódica do status
    this.statusCheckInterval = setInterval(() => this.checkStatus(), 30000); // A cada 30 segundos
  },
  
  /**
   * Verifica o status da conexão com o Google Calendar
   */
  async checkStatus() {
    try {
      const response = await API.googleCalendar.checkStatus();
      
      if (response.success) {
        this.updateStatusUI(response.connected, response.message);
      } else {
        this.updateStatusUI(false, response.message || 'Erro ao verificar status');
      }
    } catch (error) {
      console.error('Erro ao verificar status do Google Calendar:', error);
      this.updateStatusUI(false, error.message);
    }
  },
  
  /**
   * Atualiza a interface com o status atual
   * @param {boolean} connected - Se está conectado
   * @param {string} message - Mensagem de status ou erro
   */
  updateStatusUI(connected, message = '') {
    if (!this.statusElement) return;
    
    // Remove classes anteriores
    this.statusElement.classList.remove('status-connected', 'status-disconnected', 'status-connecting', 'status-error');
    
    // Determina o texto e a classe com base no estado
    let statusText = '';
    let statusClass = '';
    
    if (connected) {
      statusText = 'Conectado';
      statusClass = 'status-connected';
    } else {
      if (message.includes('Erro')) {
        statusText = `Erro: ${message}`;
        statusClass = 'status-error';
      } else {
        statusText = message || 'Desconectado';
        statusClass = 'status-disconnected';
      }
    }
    
    // Atualiza o elemento de status
    this.statusElement.textContent = statusText;
    this.statusElement.classList.add(statusClass);
    
    // Atualiza botões
    this.updateButtons(connected);
  },
  
  /**
   * Atualiza os botões de acordo com o status
   * @param {boolean} connected - Se está conectado
   */
  updateButtons(connected) {
    const connectBtn = document.getElementById('google-connect-btn');
    const disconnectBtn = document.getElementById('google-disconnect-btn');
    
    if (connectBtn) {
      connectBtn.disabled = connected;
    }
    
    if (disconnectBtn) {
      disconnectBtn.disabled = !connected;
    }
  },
  
  /**
   * Inicia o processo de conexão com o Google Calendar
   */
  async connect() {
    try {
      // Atualiza o status
      this.updateStatusUI(false, 'Conectando...');
      
      // Obtém a URL de autorização
      const response = await API.googleCalendar.getAuthUrl();
      
      if (response.success && response.authUrl) {
        // Abre a URL de autorização em uma nova janela
        window.open(response.authUrl, '_blank', 'width=600,height=700');
        
        // Exibe instruções
        this.showInstructions();
        
        // Verifica o status após alguns segundos para ver se a conexão foi bem-sucedida
        setTimeout(() => this.checkStatus(), 5000);
      } else {
        this.updateStatusUI(false, response.message || 'Não foi possível obter a URL de autorização');
      }
    } catch (error) {
      console.error('Erro ao conectar Google Calendar:', error);
      this.updateStatusUI(false, error.message);
    }
  },
  
  /**
   * Exibe instruções para o usuário
   */
  showInstructions() {
    const instructionsElement = document.getElementById('google-instructions');
    if (instructionsElement) {
      instructionsElement.style.display = 'block';
    }
  },
  
  /**
   * Processa o código de autorização do Google
   * @param {string} code - Código de autorização
   * @param {string} state - Estado (ID do usuário)
   */
  async handleAuthCode(code, state) {
    try {
      // Atualiza o status
      this.updateStatusUI(false, 'Processando autorização...');
      
      // Processa o código de autorização
      const response = await API.googleCalendar.handleAuthCode(code, state);
      
      if (response.success) {
        this.updateStatusUI(true, 'Conectado com sucesso');
      } else {
        this.updateStatusUI(false, response.message || 'Erro ao processar autorização');
      }
    } catch (error) {
      console.error('Erro ao processar código de autorização:', error);
      this.updateStatusUI(false, error.message);
    }
  },
  
  /**
   * Desconecta o Google Calendar
   */
  async disconnect() {
    try {
      // Atualiza o status
      this.updateStatusUI(false, 'Desconectando...');
      
      // Desconecta
      const response = await API.googleCalendar.disconnect();
      
      if (response.success) {
        this.updateStatusUI(false, 'Desconectado com sucesso');
      } else {
        this.updateStatusUI(false, response.message || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar Google Calendar:', error);
      this.updateStatusUI(false, error.message);
    }
  },
  
  /**
   * Limpa o intervalo de verificação ao desmontar o componente
   */
  destroy() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }
};