const express = require('express');
const { login } = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validate');
const { loginSchema } = require('../validators/authValidator');
const router = express.Router();

router.post('/login', validateRequest(loginSchema), login);

module.exports = router;
