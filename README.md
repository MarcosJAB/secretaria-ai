# Secretaria AI

Um sistema de secretária virtual que integra WhatsApp e Google Calendar para automatizar agendamentos e comunicações.

## Funcionalidades

- **Integração com WhatsApp**: Conecte sua conta do WhatsApp para enviar e receber mensagens automatizadas.
- **Integração com Google Calendar**: Sincronize com o Google Calendar para gerenciar agendamentos e compromissos.
- **Webhooks**: Comunicação com serviços externos como n8n para automação de fluxos.
- **Autenticação**: Sistema seguro de login e registro de usuários.

## Requisitos

- Node.js 14+
- NPM ou Yarn
- Conta no Google Cloud Platform (para API do Google Calendar)
- Instância da Evolution API (para WhatsApp)

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/MarcosJAB/secretaria-ai.git
   cd secretaria-ai
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

4. Inicie o servidor:
   ```
   npm start
   ```

## Configuração

### Google Calendar

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a API do Google Calendar
3. Configure as credenciais OAuth 2.0
4. Adicione a URL de redirecionamento: `https://seu-dominio.com/google-oauth-callback.html`
5. Copie o Client ID e Client Secret para o arquivo `.env`

### WhatsApp (Evolution API)

1. Configure uma instância da [Evolution API](https://github.com/evolution-api/evolution-api)
2. Obtenha a chave de API
3. Configure a URL da API no arquivo `.env`

## Estrutura do Projeto

- `/api`: Módulos de integração com serviços externos
- `/middleware`: Middlewares Express para autenticação e tratamento de erros
- `/public`: Arquivos estáticos e frontend
- `/routes`: Rotas da API
- `server.js`: Ponto de entrada da aplicação

## Uso

1. Acesse `http://localhost:3000` (ou a porta configurada)
2. Faça login ou registre-se
3. Conecte sua conta do WhatsApp escaneando o QR Code
4. Autorize o acesso ao Google Calendar
5. Configure os webhooks para integração com n8n ou outros serviços

## Licença

MIT
