const mongoose = require('mongoose')

const ChatAndPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    room: { type: String, required: true, index: true },
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
    },
    newChat: {
        type: Boolean,
        default: true
    },
    messages: [
        {
            sender: { type: String, required: true },
            text: { type: String },
            file: {
                name: { type: String },
                type: { type: String },
                content: { type: String },
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],
})

const ChatAndPayment = mongoose.model('ChatAndPayment', ChatAndPaymentSchema)
module.exports = ChatAndPayment