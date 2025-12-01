const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

router.use(authMiddleware);

/**
 * GET /api/settings/:key
 * Buscar configuração específica
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const { data, error } = await supabaseAdmin
      .from('default_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configuração'
    });
  }
});

/**
 * GET /api/settings
 * Buscar todas as configurações
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('default_settings')
      .select('*');

    if (error) throw error;

    // Transformar em objeto key-value
    const settings = {};
    data.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações'
    });
  }
});

/**
 * POST /api/settings
 * Salvar/atualizar configuração
 */
router.post('/', async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;

    if (!setting_key || !setting_value) {
      return res.status(400).json({
        success: false,
        message: 'setting_key e setting_value são obrigatórios'
      });
    }

    // Verificar se existe
    const { data: existing } = await supabaseAdmin
      .from('default_settings')
      .select('id')
      .eq('setting_key', setting_key)
      .single();

    let result;

    if (existing) {
      // Atualizar
      const { data, error } = await supabaseAdmin
        .from('default_settings')
        .update({ setting_value })
        .eq('setting_key', setting_key)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar
      const { data, error } = await supabaseAdmin
        .from('default_settings')
        .insert({ setting_key, setting_value })
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
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar configuração'
    });
  }
});

/**
 * PUT /api/settings/team-members
 * Atualizar membros da equipe padrão
 */
router.put('/team-members', async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: 'members deve ser um array'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('default_settings')
      .update({ setting_value: members })
      .eq('setting_key', 'team_members')
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Membros da equipe atualizados com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar membros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar membros'
    });
  }
});

/**
 * PUT /api/settings/default-folders
 * Atualizar pastas padrão
 */
router.put('/default-folders', async (req, res) => {
  try {
    const { folders } = req.body;

    if (!Array.isArray(folders)) {
      return res.status(400).json({
        success: false,
        message: 'folders deve ser um array'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('default_settings')
      .update({ setting_value: folders })
      .eq('setting_key', 'default_folders')
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Pastas padrão atualizadas com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar pastas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar pastas'
    });
  }
});

module.exports = router;
