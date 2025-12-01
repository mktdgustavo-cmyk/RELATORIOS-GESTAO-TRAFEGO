# 🚀 GUIA DE INSTALAÇÃO E DEPLOY

## Pré-requisitos

### Software Necessário
- [x] Node.js 18+ e npm
- [x] Docker e Docker Compose
- [x] Git
- [x] Conta no Supabase (free tier)
- [x] Credenciais UAZAPI
- [x] Conta Meta Developer
- [x] Easypanel configurado (para deploy)

---

## PARTE 1: Configuração do Supabase

### 1.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização (se não tiver)
3. Clique em "New Project"
4. Preencha:
   - Name: `traffic-reports`
   - Database Password: (anote essa senha!)
   - Region: `South America (São Paulo)`

### 1.2 Executar Schema SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo de `backend/database/schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução completa (pode levar 1-2 minutos)

### 1.3 Obter Credenciais
1. Vá em **Settings** → **API**
2. Anote:
   - **Project URL**: `SUPABASE_URL`
   - **anon public**: `VITE_SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_KEY` (⚠️ secreta, só para backend)

---

## PARTE 2: Configuração do UAZAPI

### 2.1 Criar Instância
1. Acesse [docs.uazapi.com](https://docs.uazapi.com)
2. Siga o guia de criação de instância
3. Anote:
   - `UAZAPI_INSTANCE_ID`
   - `UAZAPI_TOKEN`

### 2.2 Teste de Conexão
```bash
curl -X GET "https://api.uazapi.com/instance/connectionState/{INSTANCE_ID}" \
  -H "Authorization: Bearer {TOKEN}"
```

---

## PARTE 3: Clone e Configuração Local

### 3.1 Clonar Repositório
```bash
git clone https://github.com/seu-usuario/traffic-reports-platform.git
cd traffic-reports-platform
```

### 3.2 Configurar Variáveis de Ambiente

**Backend (.env)**
```bash
cd backend
cp ../.env.example .env
nano .env  # ou seu editor favorito
```

Preencha todas as variáveis conforme coletado.

**Frontend (.env)**
```bash
cd ../frontend
cp ../.env.example .env
nano .env
```

Preencha:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### 3.3 Instalar Dependências

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd ../frontend
npm install
```

---

## PARTE 4: Testes Locais

### 4.1 Rodar Backend
```bash
cd backend
npm run dev
```

Deve aparecer:
```
🚀 Servidor rodando na porta 3000
📝 Ambiente: development
```

### 4.2 Rodar Frontend (outro terminal)
```bash
cd frontend
npm run dev
```

Deve aparecer:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### 4.3 Teste de Login
1. Abra `http://localhost:5173`
2. Use as credenciais padrão:
   - **Email**: `admin@admin.com`
   - **Senha**: `admin123`
3. Deve logar e ver o dashboard

⚠️ **IMPORTANTE**: Altere a senha do admin imediatamente!

---

## PARTE 5: Deploy com Docker (Easypanel)

### 5.1 Preparar para Deploy
```bash
# Na raiz do projeto
cd traffic-reports-platform
```

### 5.2 Criar .env para Produção
```bash
cp .env.example .env
nano .env
```

Atualize as variáveis para produção:
```env
# Exemplos
FRONTEND_URL=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
NODE_ENV=production
```

### 5.3 Build e Push (se for usar registry)
```bash
# Build imagens
docker-compose build

# Tag para registry (opcional)
docker tag traffic-reports-backend seu-registry/traffic-reports-backend:latest
docker tag traffic-reports-frontend seu-registry/traffic-reports-frontend:latest

# Push (opcional)
docker push seu-registry/traffic-reports-backend:latest
docker push seu-registry/traffic-reports-frontend:latest
```

### 5.4 Deploy no Easypanel

**Opção A: Via Docker Compose**
1. No Easypanel, crie um novo projeto
2. Escolha "Docker Compose"
3. Cole o conteúdo do `docker-compose.yml`
4. Configure as variáveis de ambiente
5. Deploy

**Opção B: Aplicações Separadas**

**Backend:**
1. Novo App → Docker
2. Image: `seu-registry/traffic-reports-backend:latest`
3. Port: `3000`
4. Environment Variables: Cole todas do backend
5. Deploy

**Frontend:**
1. Novo App → Docker
2. Image: `seu-registry/traffic-reports-frontend:latest`
3. Port: `80`
4. Environment Variables: Cole todas do frontend
5. Deploy

### 5.5 Configurar Domínios
1. No Easypanel, adicione domínios customizados
2. Configure DNS:
   - `api.seu-dominio.com` → Backend
   - `seu-dominio.com` → Frontend
3. Habilite SSL (Let's Encrypt)

---

## PARTE 6: Configuração Pós-Deploy

### 6.1 Primeiro Acesso
1. Acesse `https://seu-dominio.com`
2. Login com admin
3. **Altere a senha** em Configurações

### 6.2 Configurações Iniciais
1. Vá em **Configurações**
2. Configure:
   - Membros da equipe padrão
   - Pastas do Drive padrão
   - Webhooks N8N

### 6.3 Conectar WhatsApp
1. Vá em **WhatsApp**
2. Clique em "Conectar Nova Instância"
3. Escaneie o QR Code com WhatsApp
4. Aguarde confirmação

### 6.4 Criar Primeiro Cliente (Teste)
1. Vá em **Clientes** → **Novo Cliente**
2. Preencha dados básicos
3. Configure contas Meta/Google
4. Defina métricas
5. Crie grupo WhatsApp

---

## PARTE 7: Integração com N8N

### 7.1 Criar Workflows N8N

**Workflow 1: Coleta Meta Ads**
```
Cron (2h diariamente)
↓
Get Clientes Ativos (Supabase)
↓
Loop Clientes
↓
HTTP Request Meta API
↓
Processar Dados
↓
Save to Supabase
```

**Workflow 2: Receber Google Ads**
```
Webhook /webhook-google/{client_id}
↓
Validar Dados
↓
Processar Métricas
↓
Save to Supabase
```

**Workflow 3: Gerar Relatórios**
```
Cron (8h diariamente)
↓
Get Dados Processados
↓
Gerar Relatórios por Cliente
↓
Enviar WhatsApp (UAZAPI)
↓
Salvar Log
```

### 7.2 Configurar Webhooks na Aplicação
1. Vá em **Configurações**
2. Adicione URLs dos webhooks N8N
3. Teste conectividade

---

## PARTE 8: Monitoramento

### 8.1 Logs
```bash
# Ver logs backend
docker logs traffic-reports-backend -f

# Ver logs frontend
docker logs traffic-reports-frontend -f
```

### 8.2 Health Checks
```bash
# Backend
curl https://api.seu-dominio.com/health

# Frontend
curl https://seu-dominio.com/health
```

### 8.3 Métricas Supabase
1. Acesse dashboard Supabase
2. Monitore:
   - Database usage
   - API requests
   - Storage

---

## ❗ Troubleshooting Comum

### Problema: Backend não conecta ao Supabase
**Solução**: Verifique se `SUPABASE_KEY` está correto (service_role, não anon)

### Problema: Frontend não carrega após login
**Solução**: Verifique `VITE_API_URL` nas variáveis de ambiente

### Problema: WhatsApp não conecta
**Solução**: 
1. Verifique credenciais UAZAPI
2. Teste conexão via curl
3. Veja logs do backend

### Problema: Scripts Google Ads não funcionam
**Solução**:
1. Verifique se o script foi colado corretamente no Google Ads
2. Verifique URL do webhook
3. Teste manualmente no Google Ads script editor

### Problema: Relatórios não são enviados
**Solução**:
1. Verifique se N8N workflows estão ativos
2. Verifique logs do N8N
3. Teste envio manual

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação UAZAPI](https://docs.uazapi.com)
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-api)
- [Google Ads Scripts](https://developers.google.com/google-ads/scripts)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique logs
2. Consulte troubleshooting
3. Abra issue no GitHub
4. Entre em contato: seu@email.com

---

## ✅ Checklist Final

- [ ] Supabase configurado e schema criado
- [ ] Variáveis de ambiente configuradas
- [ ] Backend rodando e conectando ao Supabase
- [ ] Frontend rodando e fazendo login
- [ ] WhatsApp conectado via UAZAPI
- [ ] N8N workflows criados e ativos
- [ ] Primeiro cliente teste criado
- [ ] Script Google Ads gerado e testado
- [ ] Primeiro relatório enviado com sucesso
- [ ] Senha do admin alterada
- [ ] Domínios configurados com SSL
- [ ] Monitoramento ativo

🎉 **Parabéns! Sua plataforma está no ar!**
