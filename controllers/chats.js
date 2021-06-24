let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const chatService = require('../services').chatService

router.get('/chat', auth.verifyJWT, chatService.getChatData);