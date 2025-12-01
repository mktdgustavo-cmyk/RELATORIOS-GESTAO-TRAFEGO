# 📁 ESTRUTURA COMPLETA DO PROJETO

## Visão Geral
Este documento descreve a estrutura completa de arquivos e pastas do projeto Traffic Reports Platform.

## 🗂️ Estrutura de Diretórios

```
traffic-reports-platform/
├── README.md
├── docker-compose.yml
├── .gitignore
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   ├── healthcheck.js
│   │
│   ├── database/
│   │   └── schema.sql
│   │
│   └── src/
│       ├── server.js
│       │
│       ├── config/
│       │   ├── database.js
│       │   └── env.js
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── validation.middleware.js
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── client.controller.js
│       │   ├── metrics.controller.js
│       │   ├── whatsapp.controller.js
│       │   ├── reports.controller.js
│       │   ├── settings.controller.js
│       │   └── google-ads.controller.js
│       │
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── client.routes.js
│       │   ├── metrics.routes.js
│       │   ├── whatsapp.routes.js
│       │   ├── reports.routes.js
│       │   ├── settings.routes.js
│       │   └── google-ads.routes.js
│       │
│       ├── services/
│       │   ├── google-ads-generator.service.js
│       │   ├── meta-api.service.js
│       │   ├── uazapi.service.js
│       │   ├── report-generator.service.js
│       │   └── drive.service.js
│       │
│       ├── models/
│       │   ├── Client.model.js
│       │   ├── Metrics.model.js
│       │   └── Report.model.js
│       │
│       └── utils/
│           ├── logger.js
│           ├── validators.js
│           └── helpers.js
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── stores/
│       │   ├── authStore.js
│       │   ├── clientStore.js
│       │   └── settingsStore.js
│       │
│       ├── api/
│       │   ├── axios.js
│       │   ├── auth.api.js
│       │   ├── clients.api.js
│       │   ├── metrics.api.js
│       │   ├── whatsapp.api.js
│       │   ├── reports.api.js
│       │   └── settings.api.js
│       │
│       ├── components/
│       │   │
│       │   ├── Layout/
│       │   │   ├── MainLayout.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Header.jsx
│       │   │   └── MobileMenu.jsx
│       │   │
│       │   ├── UI/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Table.jsx
│       │   │   ├── Loading.jsx
│       │   │   └── Alert.jsx
│       │   │
│       │   ├── Clients/
│       │   │   ├── ClientCard.jsx
│       │   │   ├── ClientTable.jsx
│       │   │   └── ClientFilters.jsx
│       │   │
│       │   ├── Metrics/
│       │   │   ├── MetricSelector.jsx
│       │   │   ├── MetricCard.jsx
│       │   │   └── CustomMetricForm.jsx
│       │   │
│       │   ├── WhatsApp/
│       │   │   ├── QRCodeDisplay.jsx
│       │   │   ├── GroupCreator.jsx
│       │   │   └── ConnectionStatus.jsx
│       │   │
│       │   └── Reports/
│       │       ├── ReportPreview.jsx
│       │       ├── ReportHistory.jsx
│       │       └── ReportStats.jsx
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Clients.jsx
│       │   ├── ClientForm.jsx
│       │   ├── MetricsConfig.jsx
│       │   ├── WhatsApp.jsx
│       │   ├── Reports.jsx
│       │   └── Settings.jsx
│       │
│       ├── hooks/
│       │   ├── useClients.js
│       │   ├── useMetrics.js
│       │   ├── useWhatsApp.js
│       │   └── useReports.js
│       │
│       └── utils/
│           ├── constants.js
│           ├── formatters.js
│           └── validators.js
│
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── cert.pem (produção)
│       └── key.pem (produção)
│
└── docs/
    ├── API.md
    ├── STRUCTURE.md
    ├── REPORTS_FLOW.md
    ├── WHATSAPP.md
    └── DEPLOYMENT.md
```

## 📝 Arquivos Principais Pendentes

### Backend

#### 1. `backend/src/controllers/client.controller.js`
```javascript
// CRUD completo de clientes
// - listClients()
// - getClient(id)
// - createClient()
// - updateClient(id)
// - deleteClient(id)
```

#### 2. `backend/src/controllers/metrics.controller.js`
```javascript
// Gerenciamento de métricas
// - getClientMetrics(clientId)
// - updateMetricsConfig(clientId)
// - getAvailableMetrics(platform)
```

#### 3. `backend/src/controllers/whatsapp.controller.js`
```javascript
// WhatsApp/UAZAPI
// - getConnectionStatus()
// - generateQRCode()
// - createGroup(clientId, members)
// - sendMessage(groupId, message)
```

#### 4. `backend/src/controllers/google-ads.controller.js`
```javascript
// Google Ads Scripts
// - generateScript(clientId)
// - getCustomMetrics(clientId)
// - createCustomMetric(clientId, metric)
// - deleteCustomMetric(id)
```

#### 5. `backend/src/services/uazapi.service.js`
```javascript
// Integração completa UAZAPI
// Ver documentação: https://docs.uazapi.com/
```

#### 6. `backend/src/services/report-generator.service.js`
```javascript
// Geração de relatórios personalizados
// - generateMetaReport()
// - generateGoogleReport()
// - generateMixedReport()
```

### Frontend

#### 1. `frontend/src/components/Layout/MainLayout.jsx`
```jsx
// Layout principal com sidebar dark theme
// Inspirado na imagem de referência
```

#### 2. `frontend/src/pages/Dashboard.jsx`
```jsx
// Dashboard com:
// - Resumo de clientes ativos
// - Últimos relatórios enviados
// - Métricas gerais
// - Gráficos (Recharts)
```

#### 3. `frontend/src/pages/Clients.jsx`
```jsx
// Lista de clientes com:
// - Tabela/Cards
// - Filtros
// - Ações (editar, ver métricas, relatórios)
```

#### 4. `frontend/src/pages/ClientForm.jsx`
```jsx
// Formulário de cadastro/edição
// - Dados básicos
// - Criação de grupo WhatsApp
// - IDs Meta/Google
```

#### 5. `frontend/src/pages/MetricsConfig.jsx`
```jsx
// Configuração de métricas
// - Seletor de plataforma (Meta/Google)
// - Tipos de campanha
// - Métricas principais/secundárias
// - Métricas customizadas Google
// - Gerador de script
```

#### 6. `frontend/src/pages/WhatsApp.jsx`
```jsx
// Gestão WhatsApp
// - Conexão QR Code
// - Status de conexão
// - Criação de grupos
// - Configuração de membros padrão
```

#### 7. `frontend/src/pages/Settings.jsx`
```jsx
// Configurações gerais
// - Membros da equipe padrão
// - Pastas do Drive padrão
// - Templates de relatórios
// - Configurações de webhook N8N
```

## 🚀 Próximos Passos para Implementação

### Fase 1: Setup Inicial (1-2 dias)
1. Configurar Supabase e rodar schema.sql
2. Criar usuário admin inicial
3. Configurar variáveis de ambiente
4. Build dos containers Docker
5. Testar autenticação

### Fase 2: Backend Core (3-4 dias)
1. Implementar todos os controllers pendentes
2. Criar serviços de integração (UAZAPI, Meta, Google)
3. Implementar gerador de relatórios
4. Testes de API

### Fase 3: Frontend Core (4-5 dias)
1. Criar todos os componentes de UI
2. Implementar páginas principais
3. Integrar com backend
4. Aplicar tema dark

### Fase 4: Integrações (3-4 dias)
1. Conectar UAZAPI
2. Testar criação de grupos
3. Implementar coleta Meta API
4. Testar scripts Google Ads

### Fase 5: Testes e Deploy (2-3 dias)
1. Testes end-to-end
2. Ajustes finais
3. Deploy no Easypanel
4. Documentação final

## 📌 Notas Importantes

1. **Supabase**: Configure RLS (Row Level Security) conforme necessário
2. **UAZAPI**: Obter credenciais e testar conexão
3. **Meta API**: Configurar App e obter tokens
4. **N8N**: Ajustar webhooks conforme estrutura
5. **Google Drive**: Configurar API e credenciais (OAuth2)

## 🔗 Links Úteis

- Documentação UAZAPI: https://docs.uazapi.com/
- Supabase Docs: https://supabase.com/docs
- Meta Marketing API: https://developers.facebook.com/docs/marketing-apis
- Google Ads Scripts: https://developers.google.com/google-ads/scripts/docs

## 📧 Suporte

Para dúvidas sobre a implementação, consulte os docs/ ou abra uma issue no GitHub.
