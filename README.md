# 📊 Traffic Reports Platform

Sistema unificado de gerenciamento e geração de relatórios para gestores de tráfego pago.

## 🎯 Funcionalidades

- ✅ Gestão de clientes
- ✅ Configuração personalizada de métricas (Meta Ads & Google Ads)
- ✅ Geração automática de scripts Google Ads
- ✅ Integração com WhatsApp (UAZAPI)
- ✅ Geração e envio automático de relatórios
- ✅ Dashboard com histórico de relatórios

## 🛠️ Stack Tecnológica

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Containerização**: Docker + Docker Compose
- **Deploy**: EasyPanel

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta no Supabase
- Node.js 18+ (para desenvolvimento local)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/traffic-reports-platform.git
cd traffic-reports-platform
```

### 2. Configure as variáveis de ambiente

Crie os arquivos `.env` nas pastas `frontend` e `backend`:

**backend/.env**
```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key

# Server
PORT=3001
NODE_ENV=production

# UAZAPI
UAZAPI_URL=https://api.uazapi.com
UAZAPI_TOKEN=seu-token-uazapi

# Meta API
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret

# N8N Webhook
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook
```

**frontend/.env**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:3001
```

### 3. Configure o Supabase

Execute o script SQL localizado em `database/schema.sql` no SQL Editor do Supabase.

### 4. Inicie os containers

```bash
docker-compose up -d
```

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📦 Deploy no EasyPanel

1. Faça push do código para o GitHub
2. No EasyPanel, crie um novo projeto
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente
5. Deploy!

## 📖 Documentação

- [Configuração de Clientes](./docs/clientes.md)
- [Configuração de Métricas](./docs/metricas.md)
- [Gerador de Scripts Google Ads](./docs/google-scripts.md)
- [Integração WhatsApp](./docs/whatsapp.md)

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

## 📄 Licença

MIT
