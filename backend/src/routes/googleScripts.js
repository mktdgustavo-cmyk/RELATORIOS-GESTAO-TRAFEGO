const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

router.use(authMiddleware);

/**
 * POST /api/google-scripts/generate
 * Gerar script personalizado do Google Ads
 */
router.post('/generate', async (req, res) => {
  try {
    const { client_id } = req.body;

    if (!client_id) {
      return res.status(400).json({
        success: false,
        message: 'client_id é obrigatório'
      });
    }

    // Buscar cliente e configurações
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Buscar configuração de métricas do Google
    const { data: metricsConfig } = await supabaseAdmin
      .from('metrics_config')
      .select('*')
      .eq('client_id', client_id)
      .eq('platform', 'google')
      .single();

    // Buscar métricas customizadas
    const { data: customMetrics } = await supabaseAdmin
      .from('google_custom_metrics')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true);

    // Construir lista de métricas
    const standardMetrics = metricsConfig?.selected_metrics || [
      'Cost',
      'Impressions',
      'Clicks',
      'Ctr',
      'AverageCpc',
      'Conversions',
      'CostPerConversion'
    ];

    const customMetricsNames = customMetrics?.map(m => m.metric_name) || [];

    // Gerar script
    const script = generateGoogleAdsScript(
      client,
      standardMetrics,
      customMetrics
    );

    res.json({
      success: true,
      message: 'Script gerado com sucesso',
      data: {
        script,
        client_name: client.name,
        metrics: {
          standard: standardMetrics,
          custom: customMetricsNames
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar script:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar script'
    });
  }
});

/**
 * Função auxiliar para gerar o script do Google Ads
 */
function generateGoogleAdsScript(client, standardMetrics, customMetrics) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  // Construir SELECT clause
  const selectFields = [
    'campaign.name',
    'campaign.id',
    ...standardMetrics.map(m => `metrics.${m.charAt(0).toLowerCase() + m.slice(1)}`)
  ];

  // Adicionar métricas customizadas
  if (customMetrics && customMetrics.length > 0) {
    customMetrics.forEach(metric => {
      selectFields.push(`segments.conversion_action_name`);
    });
  }

  const script = `
/**
 * Script Google Ads - ${client.name}
 * Gerado automaticamente pela Traffic Reports Platform
 * Cliente ID: ${client.id}
 */

function main() {
  const WEBHOOK_URL = '${webhookUrl}/google-ads/${client.id}';
  const CLIENT_ID = '${client.id}';
  
  // Definir período (últimos 7 dias)
  const dateRange = 'LAST_7_DAYS';
  
  try {
    // Buscar dados das campanhas
    const query = \`
      SELECT 
        campaign.name,
        campaign.id,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE 
        campaign.status = 'ENABLED'
        AND segments.date DURING \${dateRange}
      ORDER BY metrics.impressions DESC
    \`;
    
    const report = AdsApp.report(query);
    const rows = report.rows();
    const campaignsData = [];
    
    while (rows.hasNext()) {
      const row = rows.next();
      campaignsData.push({
        campaign_name: row['campaign.name'],
        campaign_id: row['campaign.id'],
        cost: (row['metrics.cost_micros'] / 1000000).toFixed(2),
        impressions: row['metrics.impressions'],
        clicks: row['metrics.clicks'],
        ctr: (row['metrics.ctr'] * 100).toFixed(2),
        cpc: (row['metrics.average_cpc'] / 1000000).toFixed(2),
        conversions: row['metrics.conversions'],
        cost_per_conversion: row['metrics.cost_per_conversion'] 
          ? (row['metrics.cost_per_conversion'] / 1000000).toFixed(2) 
          : '0.00'
      });
    }
    
    ${customMetrics && customMetrics.length > 0 ? generateCustomMetricsCode(customMetrics) : ''}
    
    // Preparar payload
    const payload = {
      client_id: CLIENT_ID,
      date_range: dateRange,
      timestamp: new Date().toISOString(),
      account_id: AdsApp.currentAccount().getCustomerId(),
      campaigns: campaignsData,
      ${customMetrics && customMetrics.length > 0 ? 'custom_metrics: customMetricsData,' : ''}
      summary: calculateSummary(campaignsData)
    };
    
    // Enviar para webhook
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      Logger.log('✅ Dados enviados com sucesso!');
      Logger.log('Total de campanhas: ' + campaignsData.length);
    } else {
      Logger.log('❌ Erro ao enviar dados. Status: ' + responseCode);
      Logger.log('Response: ' + response.getContentText());
    }
    
  } catch (error) {
    Logger.log('❌ Erro no script: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Calcular resumo dos dados
 */
function calculateSummary(campaigns) {
  const summary = {
    total_cost: 0,
    total_impressions: 0,
    total_clicks: 0,
    total_conversions: 0,
    campaigns_count: campaigns.length
  };
  
  campaigns.forEach(campaign => {
    summary.total_cost += parseFloat(campaign.cost);
    summary.total_impressions += parseInt(campaign.impressions);
    summary.total_clicks += parseInt(campaign.clicks);
    summary.total_conversions += parseFloat(campaign.conversions);
  });
  
  summary.average_ctr = summary.total_impressions > 0 
    ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(2)
    : '0.00';
    
  summary.average_cpc = summary.total_clicks > 0
    ? (summary.total_cost / summary.total_clicks).toFixed(2)
    : '0.00';
  
  summary.cost_per_conversion = summary.total_conversions > 0
    ? (summary.total_cost / summary.total_conversions).toFixed(2)
    : '0.00';
  
  return summary;
}

${customMetrics && customMetrics.length > 0 ? generateCustomMetricsHelpers() : ''}
`;

  return script;
}

/**
 * Gerar código para métricas customizadas
 */
function generateCustomMetricsCode(customMetrics) {
  return `
    // Buscar métricas customizadas
    const customMetricsData = [];
    
    ${customMetrics.map(metric => `
    // Métrica: ${metric.metric_name}
    const ${metric.metric_name.replace(/\s+/g, '_')}_query = \`
      SELECT
        segments.conversion_action_name,
        metrics.conversions
      FROM campaign
      WHERE
        campaign.status = 'ENABLED'
        AND segments.conversion_action_name CONTAINS '${metric.metric_name}'
        AND segments.date DURING \${dateRange}
    \`;
    
    const ${metric.metric_name.replace(/\s+/g, '_')}_report = AdsApp.report(${metric.metric_name.replace(/\s+/g, '_')}_query);
    const ${metric.metric_name.replace(/\s+/g, '_')}_rows = ${metric.metric_name.replace(/\s+/g, '_')}_report.rows();
    
    let ${metric.metric_name.replace(/\s+/g, '_')}_total = 0;
    while (${metric.metric_name.replace(/\s+/g, '_')}_rows.hasNext()) {
      const row = ${metric.metric_name.replace(/\s+/g, '_')}_rows.next();
      ${metric.metric_name.replace(/\s+/g, '_')}_total += row['metrics.conversions'];
    }
    
    customMetricsData.push({
      name: '${metric.metric_name}',
      type: '${metric.metric_type}',
      value: ${metric.metric_name.replace(/\s+/g, '_')}_total
    });
    `).join('\n')}
  `;
}

/**
 * Gerar funções auxiliares para métricas customizadas
 */
function generateCustomMetricsHelpers() {
  return `
/**
 * Processar métricas customizadas
 */
function processCustomMetrics(metricName, dateRange) {
  const query = \`
    SELECT
      segments.conversion_action_name,
      metrics.conversions,
      metrics.all_conversions_value
    FROM campaign
    WHERE
      campaign.status = 'ENABLED'
      AND segments.conversion_action_name CONTAINS '\${metricName}'
      AND segments.date DURING \${dateRange}
  \`;
  
  const report = AdsApp.report(query);
  const rows = report.rows();
  
  let total = 0;
  let value = 0;
  
  while (rows.hasNext()) {
    const row = rows.next();
    total += row['metrics.conversions'];
    value += row['metrics.all_conversions_value'] || 0;
  }
  
  return {
    total: total,
    value: value
  };
}
  `;
}

module.exports = router;
