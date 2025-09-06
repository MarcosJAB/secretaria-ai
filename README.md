# Secretária AI

Um sistema de integração entre WhatsApp e Google Calendar para automatizar o agendamento e gerenciamento de compromissos.

## Visão Geral

O Secretária AI é uma aplicação que conecta o WhatsApp e o Google Calendar para facilitar o agendamento de compromissos e a gestão de calendários. A aplicação permite que usuários recebam e respondam mensagens do WhatsApp automaticamente, gerenciem eventos no Google Calendar e sincronizem informações entre as duas plataformas.

## Funcionalidades Principais

- **Integração com WhatsApp**: Conexão com a Evolution API para envio e recebimento de mensagens.
- **Integração com Google Calendar**: Autenticação OAuth, criação, leitura e atualização de eventos.
- **Autenticação de Usuários**: Sistema de registro e login com JWT.
- **Dashboard**: Visualização de estatísticas e status das integrações.
- **Webhooks**: Endpoints para receber notificações de eventos externos.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT, OAuth 2.0
- **Integrações**: Google Calendar API, Evolution API (WhatsApp)
- **Frontend**: HTML, CSS, JavaScript

## Pré-requisitos

- Node.js (v14 ou superior)
- Conta no Supabase
- Projeto no Google Cloud com API do Google Calendar habilitada
- Instância da Evolution API para WhatsApp

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/MarcosJAB/secretaria-ai.git
   cd secretaria-ai
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

## Configuração

### Supabase

1. Crie um projeto no Supabase
2. Configure as tabelas necessárias (veja o esquema em `docs/database-schema.md`)
3. Obtenha a URL e a chave anônima do projeto
4. Adicione essas informações ao arquivo `.env`

### Google Calendar

1. Crie um projeto no Google Cloud Console
2. Habilite a API do Google Calendar
3. Configure as credenciais OAuth 2.0
4. Adicione as URIs de redirecionamento:
   - `http://localhost:3000/api/google-calendar/process-code`
   - `http://localhost:3000/google-callback.html`
5. Adicione as credenciais ao arquivo `.env`

### WhatsApp (Evolution API)

1. Configure uma instância da Evolution API
2. Obtenha a URL e a chave de API
3. Adicione essas informações ao arquivo `.env`

## Estrutura do Projeto

```
├── api/                  # Rotas e integrações da API
│   ├── auth.js           # Rotas de autenticação
│   ├── google-calendar-integration.js  # Integração com Google Calendar
│   ├── google-calendar-routes.js       # Rotas do Google Calendar
│   ├── webhook-routes.js # Rotas de webhook
│   ├── whatsapp-integration.js         # Integração com WhatsApp
│   └── whatsapp-routes.js              # Rotas do WhatsApp
├── config.js             # Configuração do Supabase
├── public/               # Arquivos estáticos
│   ├── css/              # Estilos CSS
│   ├── img/              # Imagens
│   ├── dashboard.html    # Página do dashboard
│   ├── google-callback.html  # Página de callback do Google
│   ├── integracoes.html  # Página de gerenciamento de integrações
│   ├── login.html        # Página de login
│   └── registro.html     # Página de registro
├── server.js             # Ponto de entrada da aplicação
├── package.json          # Dependências e scripts
└── .env.example          # Exemplo de variáveis de ambiente
```

## Uso

1. Acesse `http://localhost:3000/login.html` para fazer login
2. Configure as integrações em `http://localhost:3000/integracoes.html`
3. Visualize o dashboard em `http://localhost:3000/dashboard.html`

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para enviar um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Marcos Almeida - marcosideas@gmail.com

---

Desenvolvido com ❤️ para facilitar a vida de profissionais e empresas.