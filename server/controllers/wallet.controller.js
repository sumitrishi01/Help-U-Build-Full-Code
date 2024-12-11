const Wallet = require('../models/wallet.model')

exports.createWithdrawal = async () => {
    try {
        
    } catch (error) {
        console.log("Internal server error",error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'Internal server error'
        })
    }
}