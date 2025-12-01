const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

router.use(authMiddleware);

/**
 * GET /api/reports
 * Listar histórico de relatórios
 */
router.get('/', async (req, res) => {
  try {
    const { client_id, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('reports_history')
      .select(`
        *,
        clients (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar relatórios'
    });
  }
});

/**
 * GET /api/reports/:id
 * Buscar relatório específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('reports_history')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Relatório não encontrado'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar relatório'
    });
  }
});

/**
 * POST /api/reports
 * Salvar relatório gerado
 */
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      platform,
      period_start,
      period_end,
      metrics_data,
      report_text,
      status = 'pending'
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reports_history')
      .insert({
        client_id,
        platform,
        period_start,
        period_end,
        metrics_data,
        report_text,
        status
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Relatório salvo com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar relatório'
    });
  }
});

/**
 * PUT /api/reports/:id/status
 * Atualizar status do relatório
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, error_message } = req.body;

    const updateData = { status };
    
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    
    if (error_message) {
      updateData.error_message = error_message;
    }

    const { data, error } = await supabaseAdmin
      .from('reports_history')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status'
    });
  }
});

module.exports = router;
