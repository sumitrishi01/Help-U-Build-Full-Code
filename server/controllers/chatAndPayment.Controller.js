const Provider = require('../models/providers.model')
const User = require('../models/user.Model')
const ChatAndPayment = require('../models/chatAndPayment.Model')
require('dotenv').config()

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,   // Razorpay Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Razorpay Secret Key
});

exports.createChatAndPayment = async (req, res) => {
    try {
        const { userId, providerId, amount, time, service } = req.body;
        const emptyField = [];
        if (!userId) emptyField.push('User Id')
        if (!providerId) emptyField.push('Provider Id')
        if (!amount) emptyField.push('Amount')
        if (!time) emptyField.push('Time')
        if (!service) emptyField.push('service')
        if (emptyField.length > 0) {
            return res.status(400).json({
                message: `Please fill in the following fields: ${emptyField.join(', ')}`
            })
        }
        const user = await User.findById(userId);
        const provider = await Provider.findById(providerId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        const roomId = `${userId}_${providerId}`
        // const newChatAndPayment = new ChatAndPayment({
        //     userId,
        //     providerId,
        //     roomId: roomId,
        //     amount,
        //     time,
        //     service
        // })
        user.roomId = roomId;
        provider.roomId = roomId;
        if(!amount && amount === 0){
            return res.status(400).json({
                success: false,
                message: 'Amount cannot be zero'
            })
        }

        const razorpayOptions = {
            amount: amount * 100 || 5000000,
            currency: 'INR',
            payment_capture: 1,
        };

        const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions)

        if(!razorpayOrder) {
            return res.status(500).json({
                success: false,
                message: 'Error in creating Razorpay order'
            })
        }

        // newChatAndPayment.razorpayOrderId = razorpayOrder.id;
        const newChatAndPayment = new ChatAndPayment({
            userId,
            providerId,
            roomId: roomId,
            amount,
            time,
            service
        })
        await user.save()
        await provider.save()
        await newChatAndPayment.save()

        return res.status(201).json({
            success: true,
            message: 'Razorpay order created successfully',
            data: {
                newChatAndPayment,
                razorpayOrder
            }
        })

    } catch (error) {
        console.log("Internal server error in creating chat and payment", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}