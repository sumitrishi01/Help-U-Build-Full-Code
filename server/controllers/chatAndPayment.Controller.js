const Provider = require('../models/providers.model')
const User = require('../models/user.Model')
const ChatAndPayment = require('../models/chatAndPayment.Model')
require('dotenv').config()

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID, 
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// exports.createChatAndPayment = async (req, res) => {
//     try {
//         const { userId, providerId, amount, time, service } = req.body;
//         const emptyField = [];
//         if (!userId) emptyField.push('User Id')
//         if (!providerId) emptyField.push('Provider Id')
//         if (!amount) emptyField.push('Amount')
//         if (!time) emptyField.push('Time')
//         if (!service) emptyField.push('service')
//         if (emptyField.length > 0) {
//             return res.status(400).json({
//                 message: `Please fill in the following fields: ${emptyField.join(', ')}`
//             })
//         }
//         const user = await User.findById(userId);
//         const provider = await Provider.findById(providerId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         if (!provider) {
//             return res.status(404).json({ message: 'Provider not found' });
//         }
//         const roomId = `${userId}_${providerId}`
//         user.roomId = roomId;
//         provider.roomId = roomId;
//         if (!amount && amount === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount cannot be zero'
//             })
//         }

//         const razorpayOptions = {
//             amount: amount * 100 || 5000000,
//             currency: 'INR',
//             payment_capture: 1,
//         };

//         const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions)

//         if (!razorpayOrder) {
//             return res.status(500).json({
//                 success: false,
//                 message: 'Error in creating Razorpay order'
//             })
//         }

//         // newChatAndPayment.razorpayOrderId = razorpayOrder.id;
//         const newChatAndPayment = new ChatAndPayment({
//             userId,
//             providerId,
//             roomId: roomId,
//             amount,
//             time,
//             service
//         })
//         await user.save()
//         await provider.save()
//         await newChatAndPayment.save()

//         return res.status(201).json({
//             success: true,
//             message: 'Razorpay order created successfully',
//             data: {
//                 newChatAndPayment,
//                 razorpayOrder
//             }
//         })

//     } catch (error) {
//         console.log("Internal server error in creating chat and payment", error)
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         })
//     }
// }

exports.createChatWithNew = async (req, res) => {
    try {
        // console.log("i am hit")
        const { userId, providerId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User id is required',
            })
        }
        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider id is required',
            })
        }
        const room = `${userId}_${providerId}`
        const newChat = new ChatAndPayment({
            userId,
            providerId,
            room:room
        })
        await newChat.save();
        return res.status(201).json({
            success: true,
            message: 'New chat created successfully',
            data: newChat
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllChatRecord = async (req, res) => {
    try {
        const allChat = await ChatAndPayment.find().populate('userId').populate('providerId')
        return res.status(200).json({
            success: true,
            message: 'All chat records fetched successfully',
            data: allChat
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await ChatAndPayment.findById(id).populate('userId').populate('providerId')
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getChatByProviderid = async (req, res) => {
    try {
        const { providerId } = req.params;
        const chat = await ChatAndPayment.find({ providerId: providerId }).populate('userId').populate('providerId')
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getChatByUserid = async (req, res) => {
    try {
        const { userId } = req.params;
        const chat = await ChatAndPayment.find({ userId: userId }).populate('userId').populate('providerId')
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// exports.saveChat = async (req,res) => {
//     try {
        
//     } catch (error) {
//         console.log("Internal server error in saving chat",error)
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         })
//     }
// }