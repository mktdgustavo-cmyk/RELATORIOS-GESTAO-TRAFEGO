/**
 * Serviço para gerar scripts personalizados do Google Ads
 */

/**
 * Gera script Google Ads personalizado baseado nas configurações do cliente
 * @param {Object} clientConfig - Configurações do cliente
 * @param {Array} customMetrics - Métricas customizadas
 * @param {string} webhookUrl - URL do webhook N8N
 * @returns {string} Script formatado pronto para uso
 */
function generateGoogleAdsScript(clientConfig, customMetrics = [], webhookUrl) {
  const { client_id, google_account_id, primary_metric, secondary_metrics } = clientConfig;

  // Métricas padrão
  const standardMetrics = [
    'CampaignName',
    'CampaignId',
    'CampaignStatus',
    'Date',
    'Cost',
    'Impressions',
    'Clicks',
    'Ctr',
    'AverageCpc'
  ];

  // Adicionar métricas secundárias selecionadas
  const selectedMetrics = [...standardMetrics];
  
  if (secondary_metrics) {
    if (secondary_metrics.conversions) selectedMetrics.push('Conversions');
    if (secondary_metrics.conversion_value) selectedMetrics.push('ConversionValue');
    if (secondary_metrics.video_views) selectedMetrics.push('VideoViews');
    if (secondary_metrics.engagement_rate) selectedMetrics.push('EngagementRate');
  }

  // Adicionar métricas customizadas
  const customMetricsFields = customMetrics
    .filter(m => m.is_active)
    .map(m => m.metric_name);

  const allMetrics = [...selectedMetrics, ...customMetricsFields];

  // Gerar script
  const script = `
/**
 * Script Google Ads - ${clientConfig.client_name || 'Cliente'}
 * Gerado automaticamente pela Traffic Reports Platform
 * Cliente ID: ${client_id}
 * Data de geração: ${new Date().toISOString()}
 */

function main() {
  Logger.log('🚀 Iniciando coleta de dados...');
  
  // Configurações
  const CONFIG = {
    clientId: '${client_id}',
    webhookUrl: '${webhookUrl}',
    accountId: '${google_account_id}',
    dateRange: 'LAST_7_DAYS'
  };

  try {
    // Buscar dados das campanhas
    const campaignData = getCampaignPerformance(CONFIG.dateRange);
    
    ${customMetrics.length > 0 ? '// Buscar métricas customizadas\n    const customMetricsData = getCustomMetrics(CONFIG.dateRange);' : ''}
    
    // Preparar payload
    const payload = {
      client_id: CONFIG.clientId,
      account_id: CONFIG.accountId,
      period: CONFIG.dateRange,
      collected_at: new Date().toISOString(),
      campaigns: campaignData,
      ${customMetrics.length > 0 ? 'custom_metrics: customMetricsData,' : ''}
      primary_metric: '${primary_metric}'
    };

    // Enviar para webhook
    sendToWebhook(CONFIG.webhookUrl, payload);
    
    Logger.log('✅ Dados enviados com sucesso!');
    Logger.log('📊 Total de campanhas: ' + campaignData.length);
    
  } catch (error) {
    Logger.log('❌ Erro ao processar: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Busca performance das campanhas
 */
function getCampaignPerformance(dateRange) {
  const campaigns = [];
  
  const query = \`
    SELECT 
      ${allMetrics.join(',\\n      ')}
    FROM CAMPAIGN_PERFORMANCE_REPORT
    WHERE CampaignStatus = 'ENABLED'
    DURING \${dateRange}
  \`;

  const report = AdsApp.report(query);
  const rows = report.rows();

  while (rows.hasNext()) {
    const row = rows.next();
    
    const campaign = {
      name: row['CampaignName'],
      id: row['CampaignId'],
      status: row['CampaignStatus'],
      date: row['Date'],
      metrics: {
        spend: parseFloat(row['Cost']) || 0,
        impressions: parseInt(row['Impressions']) || 0,
        clicks: parseInt(row['Clicks']) || 0,
        ctr: parseFloat(row['Ctr']) || 0,
        cpc: parseFloat(row['AverageCpc']) || 0
      }
    };

    // Adicionar métricas secundárias se existirem
    ${generateSecondaryMetricsCode(secondary_metrics)}

    campaigns.push(campaign);
  }

  return campaigns;
}

${customMetrics.length > 0 ? generateCustomMetricsFunction(customMetrics) : ''}

/**
 * Envia dados para o webhook
 */
function sendToWebhook(url, payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    throw new Error('Webhook retornou código: ' + responseCode);
  }

  return JSON.parse(response.getContentText());
}

/**
 * Formata número para moeda
 */
function formatCurrency(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

/**
 * Formata porcentagem
 */
function formatPercentage(value) {
  return (value * 100).toFixed(2) + '%';
}
`;

  return script;
}

/**
 * Gera código para métricas secundárias
 */
function generateSecondaryMetricsCode(secondaryMetrics) {
  if (!secondaryMetrics) return '';

  let code = '';

  if (secondaryMetrics.conversions) {
    code += `
    if (row['Conversions']) {
      campaign.metrics.conversions = parseInt(row['Conversions']) || 0;
    }
    `;
  }

  if (secondaryMetrics.conversion_value) {
    code += `
    if (row['ConversionValue']) {
      campaign.metrics.conversion_value = parseFloat(row['ConversionValue']) || 0;
    }
    `;
  }

  if (secondaryMetrics.video_views) {
    code += `
    if (row['VideoViews']) {
      campaign.metrics.video_views = parseInt(row['VideoViews']) || 0;
    }
    `;
  }

  return code;
}

/**
 * Gera função para buscar métricas customizadas
 */
function generateCustomMetricsFunction(customMetrics) {
  const metricsNames = customMetrics.map(m => m.metric_name).join(', ');

  return `
/**
 * Busca métricas customizadas
 */
function getCustomMetrics(dateRange) {
  const metrics = {};
  
  const query = \`
    SELECT 
      ${metricsNames}
    FROM CAMPAIGN_PERFORMANCE_REPORT
    WHERE CampaignStatus = 'ENABLED'
    DURING \${dateRange}
  \`;

  const report = AdsApp.report(query);
  const rows = report.rows();

  while (rows.hasNext()) {
    const row = rows.next();
    
    ${customMetrics.map(m => `
    metrics['${m.metric_name}'] = row['${m.metric_name}'] || 0;
    `).join('\n    ')}
  }

  return metrics;
}
`;
}

module.exports = {
  generateGoogleAdsScript
};
