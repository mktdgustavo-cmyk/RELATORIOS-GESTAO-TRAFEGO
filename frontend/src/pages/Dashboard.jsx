export default function Dashboard() {
  return (
    <div className="animate-slide-in">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Total de Clientes</p>
          <p className="text-3xl font-bold text-primary-400">0</p>
        </div>
        
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Relatórios Enviados</p>
          <p className="text-3xl font-bold text-primary-400">0</p>
        </div>
        
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Status WhatsApp</p>
          <p className="text-sm font-medium text-gray-400">Desconectado</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Bem-vindo!</h2>
        <p className="text-gray-400">
          Configure seus clientes e métricas para começar a gerar relatórios automatizados.
        </p>
      </div>
    </div>
  );
}
