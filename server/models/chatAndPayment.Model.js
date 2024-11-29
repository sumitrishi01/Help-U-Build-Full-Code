const mongoose = require('mongoose')

const ChatAndPaymentSchema = new mongoose({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider'
    },
    roomId: {
        type: String
    },
    amount: {
        type: Number
    },
    service: {
        type: String
    },
    time: {
        type: String
    },
    razorpayOrderId: {
        type: String
    },
    transactionId: {
        type: String
    },
    PaymentStatus: {
        type: String,
        default: 'pending'
    }
})

const ChatAndPayment = mongoose.model('ChatAndPayment', ChatAndPaymentSchema)
module.exports = ChatAndPayment