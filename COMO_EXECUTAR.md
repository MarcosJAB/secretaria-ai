# Como Executar o Projeto

## Requisitos

- Node.js (versão 12 ou superior)
- NPM ou Yarn

## Passos para Execução

### 1. Clone o repositório

```bash
git clone https://github.com/MarcosJAB/secretaria-ai.git
cd secretaria-ai
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e preencha com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais e configurações:

- Credenciais do Supabase
- Chave da Evolution API (WhatsApp)
- Credenciais do Google OAuth
- Configurações de webhook
- Configurações do n8n

### 4. Execute o servidor

```bash
node server.js
# ou para desenvolvimento com auto-reload
npm run dev
```

O servidor estará disponível em http://localhost:3000 (ou na porta configurada no arquivo .env).

## Solução de Problemas

### Verificações básicas

1. Certifique-se de que o Node.js está instalado corretamente:
   ```bash
   node --version
   ```

2. Verifique se a porta 3000 não está sendo usada por outro processo. Se estiver, você pode alterar a porta no arquivo `.env`.

3. Se encontrar erros relacionados a módulos não encontrados, tente reinstalar as dependências:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Estrutura do Projeto

- `index.html` - Página inicial (landing page)
- `dashboard.html` - Painel administrativo
- `css/` - Arquivos de estilo
- `js/` - Scripts JavaScript do frontend
- `api/` - Endpoints da API
- `server.js` - Servidor Express

## Integrações

### WhatsApp (Evolution API)

Para conectar com o WhatsApp, acesse o painel administrativo em `/dashboard.html` e siga as instruções para escanear o QR Code.

### Google Calendar

Para autorizar o acesso ao Google Calendar, acesse o painel administrativo em `/dashboard.html` e clique no botão de autorização do Google Calendar.