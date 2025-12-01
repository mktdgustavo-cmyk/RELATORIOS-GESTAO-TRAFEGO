const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const { body, validationResult } = require('express-validator');

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

/**
 * GET /api/clients
 * Listar todos os clientes
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select(`
        *,
        client_contacts (*),
        metrics_config (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes'
    });
  }
});

/**
 * GET /api/clients/:id
 * Buscar cliente por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('clients')
      .select(`
        *,
        client_contacts (*),
        metrics_config (*),
        google_custom_metrics (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente'
    });
  }
});

/**
 * POST /api/clients
 * Criar novo cliente
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('meta_account_id').optional().trim(),
  body('google_account_id').optional().trim(),
  body('contacts').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, meta_account_id, google_account_id, contacts } = req.body;

    // Inserir cliente
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        name,
        meta_account_id: meta_account_id || null,
        google_account_id: google_account_id || null,
        created_by: req.user.id,
        status: 'active'
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // Inserir contatos se fornecidos
    if (contacts && contacts.length > 0) {
      const contactsData = contacts.map(contact => ({
        client_id: client.id,
        phone: contact.phone,
        name: contact.name || null,
        is_primary: contact.is_primary || false
      }));

      const { error: contactsError } = await supabaseAdmin
        .from('client_contacts')
        .insert(contactsData);

      if (contactsError) {
        console.error('Erro ao inserir contatos:', contactsError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente'
    });
  }
});

/**
 * PUT /api/clients/:id
 * Atualizar cliente
 */
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'paused'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.contacts; // Remover contacts do update direto

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente'
    });
  }
});

/**
 * DELETE /api/clients/:id
 * Deletar cliente
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cliente'
    });
  }
});

module.exports = router;
