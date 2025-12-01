# ⚡ INÍCIO RÁPIDO - 5 MINUTOS

## 🎯 Objetivo
Ter o sistema rodando localmente em **menos de 5 minutos**.

---

## ✅ Pré-requisitos Rápidos
```bash
node -v  # Deve ser >= 18
npm -v   # Qualquer versão recente
git --version  # Qualquer versão
```

Se não tiver Node.js: [nodejs.org/download](https://nodejs.org/download)

---

## 🚀 Passos

### 1️⃣ Clone (30s)
```bash
git clone https://github.com/seu-usuario/traffic-reports-platform.git
cd traffic-reports-platform
```

### 2️⃣ Configure Supabase (2min)
1. Acesse [supabase.com](https://supabase.com) → New Project
2. Anote URL e Keys
3. SQL Editor → Cole `backend/database/schema.sql` → Run

### 3️⃣ Configure Variáveis (1min)
```bash
# Backend
cd backend
cp ../.env.example .env
nano .env  # Cole suas credenciais Supabase

# Frontend
cd ../frontend
cp ../.env.example .env
nano .env  # Cole URL e anon key
```

Mínimo necessário:
```env
# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=seu_service_role_key
JWT_SECRET=qualquer_string_com_32_caracteres_ou_mais

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key
```

### 4️⃣ Instale e Rode (1.5min)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### 5️⃣ Teste (10s)
1. Abra http://localhost:5173
2. Login: `admin@admin.com` / `admin123`
3. ✅ **Funcionou!**

---

## 🎉 Pronto!

Você agora tem:
- ✅ Backend rodando na porta 3000
- ✅ Frontend rodando na porta 5173
- ✅ Supabase configurado
- ✅ Usuário admin criado
- ✅ Sistema funcionando

---

## 🔥 Comandos Essenciais

```bash
# Parar tudo: Ctrl+C nos terminais

# Resetar banco (cuidado!)
# Cole no SQL Editor do Supabase:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Depois rode schema.sql novamente

# Ver logs
cd backend && npm run dev  # já mostra logs

# Limpar tudo
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install
```

---

## 🐛 Problemas Comuns

### "Port 3000 already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mude a porta no .env
PORT=3001
```

### "Cannot connect to Supabase"
- Verifique SUPABASE_URL (deve terminar em .supabase.co)
- Verifique SUPABASE_KEY (service_role no backend, anon no frontend)
- Teste no navegador: abra a URL do Supabase

### "Login não funciona"
```bash
# Verifique se schema foi executado
# No Supabase SQL Editor:
SELECT * FROM users;
# Deve mostrar o admin
```

### "Frontend não carrega"
```bash
# Limpe cache
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

---

## 📖 Próximos Passos

Agora que está rodando:

1. **Altere senha do admin** (Configurações)
2. **Leia o README.md** (visão geral completa)
3. **Veja PROJECT_INDEX.md** (o que falta fazer)
4. **Consulte QUICK_COMMANDS.md** (comandos úteis)
5. **Comece a desenvolver!** (siga BEST_PRACTICES.md)

---

## 🆘 Precisa de Ajuda?

1. ❓ Dúvidas gerais → README.md
2. 🐛 Bugs → Abra issue no GitHub
3. 💡 Ideias → FEATURE_REQUEST template
4. 📝 Comandos → QUICK_COMMANDS.md
5. 🎯 Implementação → EXECUTIVE_SUMMARY.md

---

## ⏱️ Tempo Real

Se você seguiu os passos, deve ter levado:
- ⚡ **Experiente**: 3-4 minutos
- 👍 **Intermediário**: 5-7 minutos
- 🌱 **Iniciante**: 10-15 minutos

**Parabéns! Sistema rodando! 🎉**

Agora é só desenvolver as features pendentes!
