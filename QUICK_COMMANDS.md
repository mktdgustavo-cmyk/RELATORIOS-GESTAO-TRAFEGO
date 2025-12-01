# ⚡ GUIA RÁPIDO DE COMANDOS

## 🚀 Setup Inicial

### Clonar e Instalar
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/traffic-reports-platform.git
cd traffic-reports-platform

# Instalar backend
cd backend
npm install

# Instalar frontend
cd ../frontend
npm install
```

### Configurar Ambiente
```bash
# Backend
cd backend
cp ../.env.example .env
nano .env  # Preencher variáveis

# Frontend  
cd ../frontend
cp ../.env.example .env
nano .env  # Preencher variáveis
```

---

## 💻 Desenvolvimento Local

### Rodar Backend
```bash
cd backend
npm run dev
# Servidor: http://localhost:3000
```

### Rodar Frontend
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

### Rodar Ambos (use dois terminais)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🐳 Docker

### Build
```bash
# Build todas as imagens
docker-compose build

# Build apenas backend
docker-compose build backend

# Build apenas frontend
docker-compose build frontend
```

### Iniciar
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Parar
```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Restart
```bash
# Restart todos
docker-compose restart

# Restart apenas backend
docker-compose restart backend
```

---

## 🗄️ Supabase

### Executar Schema
```bash
# Via CLI (se tiver instalado)
supabase db push

# Ou manualmente:
# 1. Copie backend/database/schema.sql
# 2. Cole no SQL Editor do Supabase
# 3. Execute
```

### Reset Database (cuidado!)
```bash
# No SQL Editor do Supabase
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

# Depois execute schema.sql novamente
```

---

## 📦 NPM Scripts

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
npm test         # Rodar testes
npm run lint     # Linter
```

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Linter
```

---

## 🔍 Debugging

### Ver Logs Backend
```bash
# Desenvolvimento
cd backend
npm run dev

# Docker
docker logs traffic-reports-backend -f
```

### Ver Logs Frontend
```bash
# Desenvolvimento
cd frontend
npm run dev

# Docker
docker logs traffic-reports-frontend -f
```

### Inspecionar Container
```bash
# Entrar no container backend
docker exec -it traffic-reports-backend sh

# Entrar no container frontend
docker exec -it traffic-reports-frontend sh
```

---

## 🧪 Testes

### Testar API com cURL

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

**Health Check**
```bash
curl http://localhost:3000/health
```

**Com Token**
```bash
TOKEN="seu_token_jwt"
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔑 Variáveis de Ambiente Essenciais

### Backend
```bash
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
JWT_SECRET=seu_secret_32_chars_minimo
UAZAPI_BASE_URL=https://api.uazapi.com
UAZAPI_INSTANCE_ID=xxx
UAZAPI_TOKEN=xxx
```

### Frontend
```bash
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 🚨 Troubleshooting Rápido

### Backend não inicia
```bash
# Verificar variáveis de ambiente
cat backend/.env

# Verificar se porta 3000 está livre
lsof -i :3000
# ou
netstat -ano | grep 3000

# Ver logs detalhados
cd backend
npm run dev
```

### Frontend não inicia
```bash
# Limpar cache
cd frontend
rm -rf node_modules dist
npm install

# Ver logs
npm run dev
```

### Docker não builda
```bash
# Limpar cache Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache

# Ver espaço em disco
docker system df
```

### Erro de permissão (Linux)
```bash
# Dar permissões
sudo chown -R $USER:$USER .
```

---

## 📝 Git

### Primeiro Commit
```bash
git init
git add .
git commit -m "Initial commit: Base structure"
git branch -M main
git remote add origin https://github.com/seu-usuario/traffic-reports-platform.git
git push -u origin main
```

### Workflow Normal
```bash
# Criar branch para feature
git checkout -b feature/nome-da-feature

# Fazer mudanças
git add .
git commit -m "feat: descrição da feature"

# Push
git push origin feature/nome-da-feature

# Após merge no main
git checkout main
git pull
```

---

## 🔐 Segurança

### Gerar JWT Secret
```bash
# Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### Hash de Senha (bcrypt)
```javascript
// No Node REPL
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('senha123', 10);
console.log(hash);
```

---

## 📊 Performance

### Analisar Bundle Size (Frontend)
```bash
cd frontend
npm run build
npx vite-bundle-visualizer
```

### Monitorar Uso de Memória
```bash
# Docker stats
docker stats

# Específico
docker stats traffic-reports-backend
```

---

## 🔄 Atualização

### Atualizar Dependências
```bash
# Backend
cd backend
npm update
npm outdated  # Ver o que está desatualizado

# Frontend
cd frontend
npm update
npm outdated
```

### Atualizar Imagens Docker
```bash
docker-compose pull
docker-compose up -d
```

---

## ✅ Checklist Rápido

Antes de fazer commit:
```bash
[ ] npm run lint (backend e frontend)
[ ] npm test (se tiver testes)
[ ] Build local funcionando
[ ] .env atualizado (mas não commitado!)
[ ] README atualizado se necessário
```

Antes de fazer deploy:
```bash
[ ] Todas as variáveis de ambiente em produção
[ ] Build Docker funcionando
[ ] Health checks passando
[ ] SSL/HTTPS configurado
[ ] Backups do banco configurados
```

---

## 🆘 Ajuda Rápida

### Links Úteis
- [Documentação Node.js](https://nodejs.org/docs)
- [Documentação React](https://react.dev)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Docker](https://docs.docker.com)

### Comandos de Ajuda
```bash
# NPM
npm help

# Docker
docker --help
docker-compose --help

# Git
git --help
```

---

## 💡 Dica Final

**Mantenha este arquivo aberto enquanto desenvolve!**

Cole no VS Code ou tenha em uma aba separada. Todos os comandos que você vai usar 90% do tempo estão aqui.
