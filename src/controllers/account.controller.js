const accountModel = require('../models/account.model')



const createAccount = async (req, res) => {
    try{
    const user = req.user

    const account = await accountModel.create({
        user: user._id
    })
    res.status(201).json({
        success: true,
        account
    })
}catch(error){
    res.status(500).json({
        success: false,
        message: error.message
    })
}
}


const getAccount = async (req, res) => {
    try{
    const accountId = req.params.id
    const account = await accountModel.findById(accountId)
    if(!account){
        return res.status(404).json({
            message: 'Account not found'
        })
    }
    res.status(200).json({
        account
    })
}catch(error){
    res.status(500).json({
        message: error.message
    })
}
}


const getAccountBalance = async (req, res) => {
    try{
    const accountId = req.params.id
    const account = await accountModel.findOne({ _id: accountId, user: req.user._id })  
    if(!account){
        return res.status(404).json({
            message: 'Account not found'
        })
    }
    const balance = await account.getBalance()
    res.status(200).json({
        balance: balance
    })
}catch(error){
    res.status(500).json({
        message: error.message
    })
}
}

module.exports = {
    createAccount,
    getAccount,
    getAccountBalance
}

