# 🚀 Guia de Instalação - Traffic Reports Platform

## ✅ FASE 1 CONCLUÍDA

Esta é a Fase 1 do projeto, que inclui:
- ✅ Estrutura completa do projeto
- ✅ Docker e Docker Compose configurados
- ✅ Backend com Express e todas as rotas
- ✅ Frontend com React, Tailwind e tema dark
- ✅ Autenticação com Supabase
- ✅ Layout e navegação prontos
- ✅ Schema do banco de dados

## 📋 Pré-requisitos

1. **Docker e Docker Compose** instalados
2. **Node.js 18+** (para desenvolvimento local)
3. **Conta no Supabase** (gratuito)
4. **Git** instalado

## 🔧 Passo a Passo de Instalação

### 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a **URL** e **ANON_KEY** do projeto (Settings → API)
4. Vá em SQL Editor e execute o script `database/schema.sql`
5. Em Authentication → Providers, habilite "Email"
6. Em Authentication → Users, crie seu primeiro usuário:
   - Email: seu@email.com
   - Senha: suasenha123

### 2. Configurar Variáveis de Ambiente

#### Backend (.env)

Crie o arquivo `backend/.env`:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# Server
PORT=3001
NODE_ENV=development

# UAZAPI (configurar depois)
UAZAPI_URL=https://api.uazapi.com
UAZAPI_TOKEN=seu-token-quando-tiver

# Meta API (configurar depois)
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
META_ACCESS_TOKEN=seu-token

# N8N (configurar depois)
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)

Crie o arquivo `frontend/.env`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=http://localhost:3001
```

### 3. Iniciar o Projeto

#### Opção A: Com Docker (Recomendado para Produção)

```bash
# No diretório raiz do projeto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down
```

#### Opção B: Desenvolvimento Local

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 5. Fazer Login

Use as credenciais que você criou no Supabase:
- Email: seu@email.com
- Senha: suasenha123

## 🎯 Estrutura do Projeto

```
traffic-reports-platform/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configurações (Supabase, etc)
│   │   ├── middleware/        # Middlewares (auth, etc)
│   │   ├── routes/            # Rotas da API
│   │   └── server.js          # Servidor principal
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Serviços (API, etc)
│   │   ├── lib/               # Bibliotecas (Supabase)
│   │   ├── App.jsx            # Componente principal
│   │   └── main.jsx           # Ponto de entrada
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── schema.sql             # Schema do Supabase
│
├── docker-compose.yml
└── README.md
```

## 📡 API Endpoints Disponíveis

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Métricas
- `GET /api/metrics/:clientId` - Buscar configuração
- `POST /api/metrics` - Salvar configuração
- `GET /api/metrics/custom/:clientId` - Métricas customizadas
- `POST /api/metrics/custom` - Criar métrica customizada

### Relatórios
- `GET /api/reports` - Listar relatórios
- `GET /api/reports/:id` - Buscar relatório
- `POST /api/reports` - Criar relatório

### WhatsApp
- `GET /api/whatsapp/connection` - Status da conexão
- `POST /api/whatsapp/generate-qr` - Gerar QR Code
- `POST /api/whatsapp/create-group` - Criar grupo
- `POST /api/whatsapp/send-message` - Enviar mensagem

### Configurações
- `GET /api/settings` - Todas as configurações
- `POST /api/settings` - Salvar configuração

### Scripts Google Ads
- `POST /api/google-scripts/generate` - Gerar script

## 🔜 Próximas Fases

### Fase 2: Interface de Gestão de Clientes (Semanas 3-4)
- Tela de listagem de clientes
- Formulário de criação/edição
- Gerenciamento de contatos
- Integração com WhatsApp para criação de grupos

### Fase 3: Configuração de Métricas (Semanas 5-6)
- Interface de seleção de métricas Meta
- Interface de seleção de métricas Google
- Configuração de métricas customizadas
- Gerador de scripts Google Ads

### Fase 4: Geração de Relatórios (Semanas 7-8)
- Templates de relatórios
- Processamento de dados
- Envio automático via WhatsApp

### Fase 5: Testes e Ajustes (Semanas 9-10)
- Testes end-to-end
- Ajustes de UX
- Documentação

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão corretas
- Confirme que o projeto está ativo no Supabase

### Erro 401 (Unauthorized)
- Certifique-se de que criou um usuário no Supabase
- Verifique se o token está sendo enviado corretamente

### Frontend não carrega
- Confirme que ambos backend e frontend estão rodando
- Verifique o console do navegador para erros

### Docker não inicia
- Verifique se Docker está rodando: `docker ps`
- Reconstrua as imagens: `docker-compose build --no-cache`

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

✅ **FASE 1 COMPLETA E FUNCIONAL!**

Você pode avançar para a Fase 2 quando estiver pronto! 🚀
