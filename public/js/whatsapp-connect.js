/**
 * Módulo para gerenciar a conexão com o WhatsApp
 */

const WhatsAppConnect = {
  /**
   * Elemento que exibirá o QR Code
   */
  qrCodeElement: null,
  
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
   * @param {string} qrCodeElementId - ID do elemento para exibir o QR Code
   * @param {string} statusElementId - ID do elemento para exibir o status
   */
  init(qrCodeElementId, statusElementId) {
    this.qrCodeElement = document.getElementById(qrCodeElementId);
    this.statusElement = document.getElementById(statusElementId);
    
    if (!this.qrCodeElement || !this.statusElement) {
      console.error('Elementos não encontrados');
      return;
    }
    
    // Verifica o status inicial
    this.checkStatus();
    
    // Configura verificação periódica do status
    this.statusCheckInterval = setInterval(() => this.checkStatus(), 30000); // A cada 30 segundos
  },
  
  /**
   * Verifica o status da conexão com o WhatsApp
   */
  async checkStatus() {
    try {
      const response = await API.whatsapp.checkStatus();
      
      if (response.success) {
        this.updateStatusUI(response.connected, response.state);
      } else {
        this.updateStatusUI(false, 'error', response.message);
      }
    } catch (error) {
      console.error('Erro ao verificar status do WhatsApp:', error);
      this.updateStatusUI(false, 'error', error.message);
    }
  },
  
  /**
   * Atualiza a interface com o status atual
   * @param {boolean} connected - Se está conectado
   * @param {string} state - Estado da conexão
   * @param {string} message - Mensagem de erro (opcional)
   */
  updateStatusUI(connected, state, message = '') {
    if (!this.statusElement) return;
    
    // Remove classes anteriores
    this.statusElement.classList.remove('status-connected', 'status-disconnected', 'status-connecting', 'status-error');
    
    // Determina o texto e a classe com base no estado
    let statusText = '';
    let statusClass = '';
    
    if (connected) {
      statusText = 'Conectado';
      statusClass = 'status-connected';
      
      // Esconde o QR Code se estiver conectado
      if (this.qrCodeElement) {
        this.qrCodeElement.innerHTML = '';
        this.qrCodeElement.style.display = 'none';
      }
      
      // Atualiza botões
      this.updateButtons(true);
    } else {
      switch (state) {
        case 'connecting':
        case 'loading':
          statusText = 'Conectando...';
          statusClass = 'status-connecting';
          break;
        case 'not_initialized':
          statusText = 'Não inicializado';
          statusClass = 'status-disconnected';
          break;
        case 'error':
          statusText = `Erro: ${message || 'Desconhecido'}`;
          statusClass = 'status-error';
          break;
        default:
          statusText = 'Desconectado';
          statusClass = 'status-disconnected';
      }
      
      // Atualiza botões
      this.updateButtons(false);
    }
    
    // Atualiza o elemento de status
    this.statusElement.textContent = statusText;
    this.statusElement.classList.add(statusClass);
  },
  
  /**
   * Atualiza os botões de acordo com o status
   * @param {boolean} connected - Se está conectado
   */
  updateButtons(connected) {
    const connectBtn = document.getElementById('whatsapp-connect-btn');
    const disconnectBtn = document.getElementById('whatsapp-disconnect-btn');
    
    if (connectBtn) {
      connectBtn.disabled = connected;
    }
    
    if (disconnectBtn) {
      disconnectBtn.disabled = !connected;
    }
  },
  
  /**
   * Inicia o processo de conexão e exibe o QR Code
   */
  async connect() {
    try {
      if (!this.qrCodeElement) {
        console.error('Elemento QR Code não encontrado');
        return;
      }
      
      // Atualiza o status
      this.updateStatusUI(false, 'connecting');
      
      // Obtém o QR Code
      const response = await API.whatsapp.getQRCode();
      
      if (response.success && response.qrcode) {
        // Exibe o QR Code
        this.qrCodeElement.innerHTML = '';
        this.qrCodeElement.style.display = 'block';
        
        // Cria a imagem do QR Code
        const qrImg = document.createElement('img');
        qrImg.src = response.qrcode;
        qrImg.alt = 'QR Code para conexão do WhatsApp';
        qrImg.classList.add('qrcode-img');
        
        this.qrCodeElement.appendChild(qrImg);
        
        // Adiciona instruções
        const instructions = document.createElement('p');
        instructions.textContent = 'Escaneie o QR Code com seu WhatsApp para conectar';
        instructions.classList.add('qrcode-instructions');
        
        this.qrCodeElement.appendChild(instructions);
        
        // Verifica o status após alguns segundos para ver se a conexão foi bem-sucedida
        setTimeout(() => this.checkStatus(), 5000);
      } else {
        this.updateStatusUI(false, 'error', response.message || 'Não foi possível obter o QR Code');
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      this.updateStatusUI(false, 'error', error.message);
    }
  },
  
  /**
   * Desconecta o WhatsApp
   */
  async disconnect() {
    try {
      // Atualiza o status
      this.updateStatusUI(false, 'connecting', 'Desconectando...');
      
      // Desconecta
      const response = await API.whatsapp.disconnect();
      
      if (response.success) {
        this.updateStatusUI(false, 'disconnected', 'Desconectado com sucesso');
        
        // Limpa o QR Code
        if (this.qrCodeElement) {
          this.qrCodeElement.innerHTML = '';
          this.qrCodeElement.style.display = 'none';
        }
      } else {
        this.updateStatusUI(false, 'error', response.message || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      this.updateStatusUI(false, 'error', error.message);
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