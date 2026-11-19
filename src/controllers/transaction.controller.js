const transactionmodel = require("../models/transaction.model");
const ledgermodel = require("../models/ledger.model");
const accountmodel = require("../models/account.model");
const mongoose = require("mongoose");


async function createTransaction(req, res) {
   /** 
    * 1. Validate the request body to ensure that fromAccount, toAccount, amount, and idempotencyKey are provided.
    */
       const { fromAccount, toAccount, amount,idempotencyKey } = req.body;
       if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({  message: "fromAccount, toAccount, amount, and idempotencyKey are required" });
        }
        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
          return res
            .status(400)
            .json({ message: "Amount must be greater than zero" });
        }

        if (fromAccount.toString() === toAccount.toString()) {
          return res
            .status(400)
            .json({ message: "fromAccount and toAccount must be different" });
        }
        const fromuserAccount = await accountmodel.findOne({ _id: fromAccount } );
        const touserAccount = await accountmodel.findOne({ _id: toAccount });
        if (!fromuserAccount || !touserAccount) {
            return res.status(404).json({ message: "One or both accounts not found" });
        }
        /**
         * 2.validate the idempotencyKey to ensure that the same transaction is not processed multiple times.
         */
        const existingTransaction = await transactionmodel.findOne({ idempotencyKey: idempotencyKey });

     if (existingTransaction?.status === "COMPLETED") {
       return res
         .status(400)
         .json({
           message:
             "Transaction with this idempotencyKey has already been completed",
         });
     }
     if (existingTransaction?.status === "PENDING") {
       return res
         .status(400)
         .json({
           message: "Transaction with this idempotencyKey is still pending",
         });
     }
     if (existingTransaction?.status === "FAILED") {
       return res
         .status(400)
         .json({
           message: "Transaction with this idempotencyKey has already failed",
         });
     }
     if (existingTransaction?.status === "REVERSED") {
       return res
         .status(400)
         .json({
           message:
             "Transaction with this idempotencyKey has already been reversed",
         });
     }

        /**
         * 3.check account status of both accounts to ensure that they are ACTIVE and not FROZEN or CLOSED.
         */
        if (fromuserAccount.status !== "ACTIVE" || touserAccount.status !== "ACTIVE") {
            return res.status(400).json({ message: "Both accounts should be ACTIVE to process the transaction" });
        }

        /**
         * 4. derive sender balance from sender
         */

       const balance = await fromuserAccount.getBalance();

       if(balance<amount){
        return res.status(400).json({ message: `Insufficient balance . Available balance: ${balance}, Requested amount: ${amount}` });
       }

       /**
        * 5.create a new transaction with status PENDING .
        */

       const session = await mongoose.startSession();
       try{
       session.startTransaction();

       const [transaction] = await transactionmodel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
       }],{session});
       
       const debitLedgerEntry = await ledgermodel.create([{
        account: fromAccount,
        type: "DEBIT",
        amount: amount,
        transaction: transaction._id
       }],{session});

       const creditLedgerEntry = await ledgermodel.create([{
        account: toAccount,
        type: "CREDIT",
        amount: amount,
        transaction: transaction._id
       }],{session});
       
       transaction.status = "COMPLETED";
       await transaction.save({session});
       await session.commitTransaction();

       return res.status(201).json({
        message: "Transaction completed successfully",
        status: "success",
        transaction: transaction
       })
    }catch(error){
        await session.abortTransaction();
        return res.status(500).json({
            message: error.message
        })
    }finally{   
       session.endSession();
}
}

/**
 * 
 * 6. create a function to create initial transaction for user from system account .
 */
async function createinitialTransaction(req,res){
    const {  toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "toAccount, amount, and idempotencyKey are required" });
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }
    const touserAccount = await accountmodel.findOne({ 
        _id: toAccount
     });
    if (!touserAccount) {
        return res.status(404).json({ message: "toAccount not found" });
    }
    const fromuserAccount = await accountmodel.findOne({ 
        systemUser: true,
         user:req.user._id
         });
    if (!fromuserAccount) {
        return res.status(404).json({ message: "System account not found" });
    }


    const session = await mongoose.startSession();

    try{
    session.startTransaction();

    const [transaction] = await transactionmodel.create([{    
        fromAccount: fromuserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session });

    const debitLedgerEntry = await ledgermodel.create([{
        account: fromuserAccount._id,
        type: "DEBIT",
        amount: amount,
        transaction: transaction._id
    }], { session });

    const creditLedgerEntry = await ledgermodel.create([{
        account: toAccount,
        type: "CREDIT",
        amount: amount,
        transaction: transaction._id
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
        message: "Initial transaction completed successfully",
        status: "success",
        transaction: transaction
    });
} catch(error){
    await session.abortTransaction();
    return res.status(500).json({
        message: error.message
    });
} finally {
    session.endSession();
}
}


module.exports = {
    createTransaction,
    createinitialTransaction
}