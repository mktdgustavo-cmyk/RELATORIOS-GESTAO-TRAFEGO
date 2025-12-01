-- Traffic Reports Platform - Database Schema
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  whatsapp_group_id VARCHAR(255),
  meta_account_id VARCHAR(255),
  google_account_id VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contatos do cliente
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Configuração de métricas
CREATE TABLE IF NOT EXISTS metrics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('meta', 'google')),
  campaign_type VARCHAR(50),
  primary_metric VARCHAR(100),
  selected_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  metric_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, platform)
);

-- 4. Métricas customizadas do Google
CREATE TABLE IF NOT EXISTS google_custom_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  metric_name VARCHAR(255) NOT NULL,
  metric_type VARCHAR(50),
  formula TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Templates de relatórios
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('meta', 'google', 'both')),
  template_text TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Histórico de relatórios
CREATE TABLE IF NOT EXISTS reports_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('meta', 'google', 'both')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics_data JSONB NOT NULL,
  report_text TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Configurações padrão
CREATE TABLE IF NOT EXISTS default_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Conexões WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_name VARCHAR(255) NOT NULL,
  instance_id VARCHAR(255) UNIQUE,
  qr_code TEXT,
  status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Dados brutos Meta
CREATE TABLE IF NOT EXISTS raw_data_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Dados brutos Google
CREATE TABLE IF NOT EXISTS raw_data_google (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX idx_metrics_config_client_id ON metrics_config(client_id);
CREATE INDEX idx_reports_history_client_id ON reports_history(client_id);
CREATE INDEX idx_reports_history_period ON reports_history(period_start, period_end);
CREATE INDEX idx_raw_data_meta_client_id ON raw_data_meta(client_id);
CREATE INDEX idx_raw_data_google_client_id ON raw_data_google(client_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_config_updated_at BEFORE UPDATE ON metrics_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_default_settings_updated_at BEFORE UPDATE ON default_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON whatsapp_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO default_settings (setting_key, setting_value) VALUES
('team_members', '[]'::jsonb),
('default_folders', '[
  "Criativos",
  "Relatórios",
  "Planilhas",
  "Documentos"
]'::jsonb),
('report_schedule', '{
  "frequency": "weekly",
  "day": "monday",
  "time": "08:00"
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Row Level Security (RLS) - Segurança
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_custom_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários autenticados podem ver tudo
CREATE POLICY "Usuários autenticados podem ver clientes"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir clientes"
  ON clients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON clients FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON clients FOR DELETE
  USING (auth.role() = 'authenticated');

-- Aplicar políticas similares para outras tabelas
CREATE POLICY "Usuários autenticados podem acessar client_contacts"
  ON client_contacts FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem acessar metrics_config"
  ON metrics_config FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem acessar google_custom_metrics"
  ON google_custom_metrics FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem acessar report_templates"
  ON report_templates FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem acessar reports_history"
  ON reports_history FOR ALL
  USING (auth.role() = 'authenticated');

-- Comentários nas tabelas
COMMENT ON TABLE clients IS 'Armazena informações dos clientes';
COMMENT ON TABLE client_contacts IS 'Contatos dos clientes para adicionar nos grupos do WhatsApp';
COMMENT ON TABLE metrics_config IS 'Configurações personalizadas de métricas por cliente';
COMMENT ON TABLE google_custom_metrics IS 'Métricas customizadas criadas no Google Ads';
COMMENT ON TABLE report_templates IS 'Templates personalizados de relatórios';
COMMENT ON TABLE reports_history IS 'Histórico de todos os relatórios enviados';
COMMENT ON TABLE default_settings IS 'Configurações padrão do sistema';
COMMENT ON TABLE whatsapp_connections IS 'Conexões ativas do WhatsApp';
COMMENT ON TABLE raw_data_meta IS 'Dados brutos coletados da API do Meta';
COMMENT ON TABLE raw_data_google IS 'Dados brutos coletados dos scripts do Google Ads';
