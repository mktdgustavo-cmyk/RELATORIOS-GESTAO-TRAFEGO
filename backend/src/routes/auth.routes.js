const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', asyncHandler(authController.register));

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', asyncHandler(authController.login));

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário atual
 * @access  Private
 */
router.get('/profile', authenticate, asyncHandler(authController.getProfile));

/**
 * @route   PUT /api/auth/password
 * @desc    Atualizar senha
 * @access  Private
 */
router.put('/password', authenticate, asyncHandler(authController.updatePassword));

module.exports = router;
