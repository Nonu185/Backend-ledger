const express = require("express");
const { authMiddlewear } = require("../middlewear/auth.middlewear");
const { createAccount,getAccount,getAccountBalance} = require("../controllers/account.controller");

const router = express.Router();
/**
 * 
 * -/api/account/create
 * -createAccount controller to create a new account for the authenticated user
 * 
 */
router.post('/create',authMiddlewear,createAccount)

/**
 * -/api/account/:id
 * -getAccount controller to get account details by account id
 */
router.get('/:id',authMiddlewear,getAccount)

/**
 * -/api/account/balance/:id
 * -getAccount controller to get account balance by account id
 */
router.get('/balance/:id/',authMiddlewear,getAccountBalance)


module.exports = router;


