-- ============================================
-- TRAFFIC REPORTS PLATFORM - DATABASE SCHEMA
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'traffic_manager' CHECK (role IN ('admin', 'traffic_manager', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABELA: clients
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  
  -- WhatsApp
  whatsapp_group_id VARCHAR(255),
  whatsapp_group_name VARCHAR(255),
  client_phone_numbers TEXT[], -- Array de telefones do cliente
  
  -- Contas de Anúncios
  meta_account_id VARCHAR(255),
  google_account_id VARCHAR(255),
  
  -- Configurações
  report_frequency VARCHAR(50) DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'monthly')),
  report_day_of_week INT CHECK (report_day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  report_time TIME DEFAULT '08:00:00',
  
  -- Google Drive
  drive_folder_id VARCHAR(255),
  drive_folder_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_meta_account ON clients(meta_account_id);
CREATE INDEX idx_clients_google_account ON clients(google_account_id);

-- ============================================
-- TABELA: client_metrics_config
-- ============================================
CREATE TABLE IF NOT EXISTS client_metrics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google')),
  
  -- Tipos de campanha ativos
  campaign_types TEXT[], -- ['lead', 'sales', 'messages', 'traffic']
  
  -- Regra de métrica principal
  -- Para Meta: 'results', 'messages', 'purchases', etc
  -- Para Google: nome da métrica nativa ou custom
  primary_metric VARCHAR(255) NOT NULL,
  primary_metric_label VARCHAR(255), -- Label amigável para o relatório
  
  -- Métricas secundárias (JSON)
  -- Ex: {"spend": true, "impressions": true, "clicks": true, ...}
  secondary_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Configurações adicionais
  show_best_creatives BOOLEAN DEFAULT false,
  best_creatives_count INT DEFAULT 5,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, platform)
);

-- Índices
CREATE INDEX idx_metrics_config_client ON client_metrics_config(client_id);
CREATE INDEX idx_metrics_config_platform ON client_metrics_config(platform);

-- ============================================
-- TABELA: google_custom_metrics
-- ============================================
CREATE TABLE IF NOT EXISTS google_custom_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  metric_name VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL, -- 'conversion', 'custom_column', etc
  metric_formula TEXT, -- Para métricas calculadas
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_custom_metrics_client ON google_custom_metrics(client_id);

-- ============================================
-- TABELA: reports
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Dados do relatório (JSON)
  meta_data JSONB,
  google_data JSONB,
  
  -- Texto formatado do relatório
  report_text TEXT NOT NULL,
  
  -- Status de envio
  sent_at TIMESTAMP WITH TIME ZONE,
  send_status VARCHAR(50) DEFAULT 'pending' CHECK (send_status IN ('pending', 'sent', 'failed')),
  send_error TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reports_client ON reports(client_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
CREATE INDEX idx_reports_status ON reports(send_status);

-- ============================================
-- TABELA: whatsapp_connections
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_name VARCHAR(255) NOT NULL,
  instance_id VARCHAR(255) UNIQUE NOT NULL,
  qr_code TEXT,
  status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'qr_code', 'connected', 'error')),
  phone_number VARCHAR(50),
  connected_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: whatsapp_groups
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  group_id VARCHAR(255) UNIQUE NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  group_invite_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_whatsapp_groups_client ON whatsapp_groups(client_id);

-- ============================================
-- TABELA: system_settings
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description) VALUES
  ('default_team_members', '[]'::jsonb, 'Membros da equipe adicionados automaticamente em grupos'),
  ('default_drive_folders', '["Criativos", "Relatórios", "Materiais"]'::jsonb, 'Pastas criadas automaticamente no Drive'),
  ('report_template_meta', '{}'::jsonb, 'Template padrão de relatório Meta'),
  ('report_template_google', '{}'::jsonb, 'Template padrão de relatório Google')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TABELA: audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_config_updated_at
  BEFORE UPDATE ON client_metrics_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_metrics_updated_at
  BEFORE UPDATE ON google_custom_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Usuário Admin
-- ============================================

-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@admin.com', '$2a$10$X3PQK5Ys6QY0p3wJHZYyXOLGz0nDf7zHmPkGvLfYQ0ViW3xKZEsXC', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- POLICIES (RLS - Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_custom_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies básicas (ajustar conforme necessidade)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de clientes com últimos relatórios
CREATE OR REPLACE VIEW clients_with_last_report AS
SELECT 
  c.*,
  r.id as last_report_id,
  r.period_start as last_report_period_start,
  r.period_end as last_report_period_end,
  r.sent_at as last_report_sent_at,
  r.send_status as last_report_status
FROM clients c
LEFT JOIN LATERAL (
  SELECT * FROM reports 
  WHERE client_id = c.id 
  ORDER BY created_at DESC 
  LIMIT 1
) r ON true;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
