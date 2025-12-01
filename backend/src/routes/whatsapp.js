const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');

router.use(authMiddleware);

const UAZAPI_URL = process.env.UAZAPI_URL;
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN;

/**
 * GET /api/whatsapp/connection
 * Verificar status da conexão
 */
router.get('/connection', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar conexão'
    });
  }
});

/**
 * POST /api/whatsapp/generate-qr
 * Gerar QR Code para conexão
 */
router.post('/generate-qr', async (req, res) => {
  try {
    const { instance_name } = req.body;

    // Chamar UAZAPI para gerar QR Code
    const response = await axios.post(
      `${UAZAPI_URL}/instance/create`,
      {
        instanceName: instance_name || 'traffic-reports'
      },
      {
        headers: {
          'Authorization': `Bearer ${UAZAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { instanceId, qrcode } = response.data;

    // Salvar no banco
    const { data, error } = await supabaseAdmin
      .from('whatsapp_connections')
      .insert({
        instance_name: instance_name || 'traffic-reports',
        instance_id: instanceId,
        qr_code: qrcode,
        status: 'connecting'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'QR Code gerado com sucesso',
      data: {
        qr_code: qrcode,
        instance_id: instanceId
      }
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao gerar QR Code'
    });
  }
});

/**
 * POST /api/whatsapp/create-group
 * Criar grupo do WhatsApp
 */
router.post('/create-group', async (req, res) => {
  try {
    const { client_id, group_name, participants } = req.body;

    if (!client_id || !group_name || !participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'client_id, group_name e participants são obrigatórios'
      });
    }

    // Buscar instance_id ativa
    const { data: connection } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('instance_id, status')
      .eq('status', 'connected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!connection) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma conexão WhatsApp ativa'
      });
    }

    // Criar grupo via UAZAPI
    const response = await axios.post(
      `${UAZAPI_URL}/group/create`,
      {
        instanceId: connection.instance_id,
        name: group_name,
        participants: participants.map(p => p.replace(/\D/g, '')) // Remover caracteres não numéricos
      },
      {
        headers: {
          'Authorization': `Bearer ${UAZAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { groupId } = response.data;

    // Atualizar cliente com group_id
    await supabaseAdmin
      .from('clients')
      .update({ whatsapp_group_id: groupId })
      .eq('id', client_id);

    res.json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: {
        group_id: groupId,
        group_name
      }
    });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao criar grupo'
    });
  }
});

/**
 * POST /api/whatsapp/add-participants
 * Adicionar participantes ao grupo
 */
router.post('/add-participants', async (req, res) => {
  try {
    const { group_id, participants } = req.body;

    if (!group_id || !participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'group_id e participants são obrigatórios'
      });
    }

    // Buscar instance_id ativa
    const { data: connection } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('instance_id')
      .eq('status', 'connected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!connection) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma conexão WhatsApp ativa'
      });
    }

    // Adicionar participantes via UAZAPI
    await axios.post(
      `${UAZAPI_URL}/group/participants/add`,
      {
        instanceId: connection.instance_id,
        groupId: group_id,
        participants: participants.map(p => p.replace(/\D/g, ''))
      },
      {
        headers: {
          'Authorization': `Bearer ${UAZAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Participantes adicionados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar participantes:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao adicionar participantes'
    });
  }
});

/**
 * POST /api/whatsapp/send-message
 * Enviar mensagem para grupo
 */
router.post('/send-message', async (req, res) => {
  try {
    const { group_id, message } = req.body;

    if (!group_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'group_id e message são obrigatórios'
      });
    }

    // Buscar instance_id ativa
    const { data: connection } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('instance_id')
      .eq('status', 'connected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!connection) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma conexão WhatsApp ativa'
      });
    }

    // Enviar mensagem via UAZAPI
    await axios.post(
      `${UAZAPI_URL}/message/sendText`,
      {
        instanceId: connection.instance_id,
        to: group_id,
        message: message
      },
      {
        headers: {
          'Authorization': `Bearer ${UAZAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao enviar mensagem'
    });
  }
});

module.exports = router;
