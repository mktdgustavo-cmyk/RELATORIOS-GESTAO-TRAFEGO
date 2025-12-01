# 🎯 BOAS PRÁTICAS DO PROJETO

## 📋 Convenções de Código

### JavaScript/JSX

#### Nomenclatura
```javascript
// ✅ BOM
const userProfile = {};
const fetchUserData = () => {};
const MAX_RETRIES = 3;
const isLoggedIn = true;

// ❌ RUIM
const user_profile = {};
const FetchData = () => {};
const maxretries = 3;
const logged_in = true;
```

#### Componentes React
```javascript
// ✅ BOM - PascalCase para componentes
const UserCard = ({ user }) => {
  return <div>{user.name}</div>;
};

// ✅ BOM - Hooks no topo
const MyComponent = () => {
  const [state, setState] = useState();
  const data = useSomeHook();
  
  // lógica depois
};

// ❌ RUIM
const myComponent = () => {}; // deveria ser PascalCase
```

#### Funções e Hooks
```javascript
// ✅ BOM - camelCase
const handleClick = () => {};
const useCustomHook = () => {};

// ✅ BOM - Funções assíncronas explícitas
const fetchData = async () => {
  const result = await api.get();
  return result;
};
```

---

## 🗂️ Estrutura de Arquivos

### Backend
```
src/
├── controllers/     # Lógica de rotas
├── middlewares/     # Middlewares customizados
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio
├── models/          # Modelos de dados (opcional)
├── utils/           # Funções auxiliares
└── config/          # Configurações
```

### Frontend
```
src/
├── components/      # Componentes reutilizáveis
│   ├── UI/         # Componentes de interface
│   └── Layout/     # Layouts
├── pages/          # Páginas da aplicação
├── stores/         # State management (Zustand)
├── api/            # Serviços de API
├── hooks/          # Custom hooks
├── utils/          # Funções auxiliares
└── styles/         # Estilos globais
```

---

## 💬 Commits

### Formato
```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada (opcional)>

<rodapé (opcional)>
```

### Tipos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas de build, etc

### Exemplos
```bash
# ✅ BOM
feat(auth): adiciona login com Google
fix(api): corrige erro na validação de email
docs(readme): atualiza instruções de instalação

# ❌ RUIM
update stuff
fixed bug
changes
```

---

## 🔒 Segurança

### Nunca Commite
```bash
# ❌ NUNCA
.env
*.pem
*.key
node_modules/
dist/
build/
credentials.json
secrets/
```

### Sempre Use
```javascript
// ✅ Variáveis de ambiente
const apiKey = process.env.API_KEY;

// ✅ Validação de inputs
const { body, validationResult } = require('express-validator');

// ✅ Sanitização
const sanitizedInput = validator.escape(userInput);

// ✅ Rate limiting
const rateLimit = require('express-rate-limit');
```

---

## 📝 Comentários

### Quando Comentar
```javascript
// ✅ BOM - Explicar "por quê", não "o quê"
// Usando setTimeout aqui porque o webhook pode demorar
setTimeout(() => sendWebhook(), 1000);

// ✅ BOM - Lógica complexa
// Algoritmo de Dijkstra para encontrar caminho mais curto
const shortestPath = dijkstra(graph, start, end);

// ❌ RUIM - Óbvio
// Incrementa i em 1
i++;
```

### JSDoc
```javascript
/**
 * Gera script Google Ads personalizado
 * @param {Object} config - Configurações do cliente
 * @param {Array<string>} metrics - Métricas a incluir
 * @returns {string} Script formatado
 */
function generateScript(config, metrics) {
  // implementação
}
```

---

## 🎨 Estilização (Tailwind)

### Ordem de Classes
```jsx
// ✅ BOM - Layout → Box Model → Visual → Misc
<div className="
  flex items-center justify-between
  w-full p-4 m-2
  bg-dark-800 border border-dark-700 rounded-lg
  text-white font-medium
  hover:bg-dark-700 transition-all
">

// ❌ RUIM - Aleatório
<div className="text-white hover:bg-dark-700 flex p-4 w-full bg-dark-800">
```

### Classes Customizadas
```css
/* ✅ BOM - Reutilizáveis */
.btn-primary {
  @apply px-4 py-2 bg-primary-500 hover:bg-primary-600;
}

/* ❌ RUIM - Muito específico */
.button-on-homepage-in-hero {
  @apply ...;
}
```

---

## 🧪 Testes

### Nomenclatura
```javascript
// ✅ BOM - Descritivo
describe('UserController', () => {
  it('should return user profile when authenticated', () => {});
  it('should return 401 when token is invalid', () => {});
});

// ❌ RUIM
describe('test', () => {
  it('works', () => {});
});
```

---

## 🚀 Performance

### Frontend
```javascript
// ✅ BOM - Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ✅ BOM - Memoização
const expensiveValue = useMemo(() => 
  computeExpensiveValue(a, b), 
  [a, b]
);

// ✅ BOM - Debounce em buscas
const debouncedSearch = debounce(searchFn, 300);
```

### Backend
```javascript
// ✅ BOM - Select específico
const user = await supabase
  .from('users')
  .select('id, name, email') // só o necessário
  .eq('id', userId)
  .single();

// ❌ RUIM - Select *
const user = await supabase
  .from('users')
  .select('*'); // traz tudo
```

---

## 📊 Logs

### Níveis
```javascript
// ✅ BOM - Níveis apropriados
console.log('Servidor iniciado'); // info
console.warn('Token expirando em breve'); // warning
console.error('Falha ao conectar DB', error); // error

// ✅ BOM - Contexto
console.log('Processando relatório', {
  clientId,
  reportType,
  timestamp: new Date()
});
```

### Produção
```javascript
// ✅ BOM - Logger estruturado
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🔄 Estado (Zustand)

```javascript
// ✅ BOM - Store organizada
export const useClientStore = create((set, get) => ({
  // Estado
  clients: [],
  loading: false,
  error: null,
  
  // Ações
  fetchClients: async () => {
    set({ loading: true });
    try {
      const data = await api.getClients();
      set({ clients: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // Selectors
  getClientById: (id) => {
    return get().clients.find(c => c.id === id);
  }
}));
```

---

## 🌐 API

### Endpoints
```javascript
// ✅ BOM - RESTful
GET    /api/clients           # Lista
GET    /api/clients/:id       # Busca um
POST   /api/clients           # Cria
PUT    /api/clients/:id       # Atualiza completo
PATCH  /api/clients/:id       # Atualiza parcial
DELETE /api/clients/:id       # Deleta

// ❌ RUIM
GET    /api/getClients
POST   /api/createNewClient
POST   /api/deleteClient
```

### Respostas
```javascript
// ✅ BOM - Formato consistente
res.json({
  success: true,
  data: { ... },
  message: 'Cliente criado com sucesso'
});

// ✅ BOM - Erros
res.status(400).json({
  success: false,
  message: 'Email já cadastrado',
  error: 'DUPLICATE_EMAIL'
});
```

---

## 🔍 Code Review

### Checklist
- [ ] Código faz o que deveria fazer
- [ ] Testes passam
- [ ] Sem console.logs esquecidos
- [ ] Sem código comentado
- [ ] Nomenclatura clara
- [ ] Sem duplicação
- [ ] Tratamento de erros
- [ ] Performance OK
- [ ] Segurança OK
- [ ] Documentação atualizada

---

## 💡 Dicas Gerais

1. **DRY** - Don't Repeat Yourself
2. **KISS** - Keep It Simple, Stupid
3. **YAGNI** - You Aren't Gonna Need It
4. **Fail Fast** - Valide cedo
5. **Single Responsibility** - Uma função, um propósito
6. **Readable > Clever** - Código legível > código "inteligente"

---

## 📚 Recursos

- [Clean Code](https://www.amazon.com.br/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Lembre-se**: Código é lido muito mais vezes do que escrito. Escreva para humanos, não para máquinas! 🚀
