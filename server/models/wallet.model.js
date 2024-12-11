const mongoose = require('mongoose')

const WalletSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Types.ObjectId,
        ref: 'Provider'
    },
    amount: {
        type: Number
    },
    status:{
        type:String,
        default: 'Pending',
        enum: ['Pending','Approved','Rejected']
    },
})

const Wallet = mongoose.model('Wallet', WalletSchema)
module.exports = Wallet;