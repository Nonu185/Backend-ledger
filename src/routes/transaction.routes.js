const express = require('express');
const router = express.Router();
const {authMiddlewear,authSystemMiddlewear} = require("../middlewear/auth.middlewear")
const {createTransaction,createinitialTransaction} = require("../controllers/transaction.controller")

router.post("/",authMiddlewear,createTransaction)

/**
 * Create an initial fund transaction
 */
router.post('/initial-fund',authSystemMiddlewear,createinitialTransaction);


module.exports = router;