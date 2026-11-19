const express = require('express');
const router = express.Router();
const { userregister, userlogin,userlogout } = require('../controllers/auth.controller.js');

router.post('/register',userregister);
router.post('/login',userlogin);
router.post('/logout',userlogout);

module.exports = router;