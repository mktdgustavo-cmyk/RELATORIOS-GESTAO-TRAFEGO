const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const { body, validationResult } = require('express-validator');

router.use(authMiddleware);

/**
 * GET /api/metrics/:clientId
 * Buscar configuração de métricas do cliente
 */
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('metrics_config')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas'
    });
  }
});

/**
 * POST /api/metrics
 * Salvar configuração de métricas
 */
router.post('/', [
  body('client_id').notEmpty(),
  body('platform').isIn(['meta', 'google']),
  body('selected_metrics').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      client_id,
      platform,
      campaign_type,
      primary_metric,
      selected_metrics,
      metric_rules
    } = req.body;

    // Verificar se já existe configuração
    const { data: existing } = await supabaseAdmin
      .from('metrics_config')
      .select('id')
      .eq('client_id', client_id)
      .eq('platform', platform)
      .single();

    let result;

    if (existing) {
      // Atualizar existente
      const { data, error } = await supabaseAdmin
        .from('metrics_config')
        .update({
          campaign_type,
          primary_metric,
          selected_metrics,
          metric_rules: metric_rules || {}
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar novo
      const { data, error } = await supabaseAdmin
        .from('metrics_config')
        .insert({
          client_id,
          platform,
          campaign_type,
          primary_metric,
          selected_metrics,
          metric_rules: metric_rules || {}
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      message: 'Configuração salva com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao salvar métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar métricas'
    });
  }
});

/**
 * GET /api/metrics/custom/:clientId
 * Buscar métricas customizadas do Google
 */
router.get('/custom/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('google_custom_metrics')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar métricas customizadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas customizadas'
    });
  }
});

/**
 * POST /api/metrics/custom
 * Criar métrica customizada do Google
 */
router.post('/custom', [
  body('client_id').notEmpty(),
  body('metric_name').trim().notEmpty(),
  body('metric_type').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { client_id, metric_name, metric_type, formula } = req.body;

    const { data, error } = await supabaseAdmin
      .from('google_custom_metrics')
      .insert({
        client_id,
        metric_name,
        metric_type,
        formula: formula || null,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Métrica customizada criada com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao criar métrica customizada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar métrica customizada'
    });
  }
});

/**
 * DELETE /api/metrics/custom/:id
 * Deletar métrica customizada
 */
router.delete('/custom/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('google_custom_metrics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Métrica customizada deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar métrica customizada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar métrica customizada'
    });
  }
});

module.exports = router;
