const User = require("../models/user.Model");
const sendEmail = require("../utils/SendEmail");
const sendToken = require("../utils/SendToken");
const generateOtp = require("../utils/GenreateOtp")
const Provider = require("../models/providers.model");
const { uploadToCloudinary } = require("../utils/Cloudnary");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios')
require('dotenv').config()
const { validatePaymentVerification, validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { default: mongoose } = require("mongoose");
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.registeruser = async (req, res) => {
    try {
        const { name, email, PhoneNumber, Password, cPassword } = req.body;
        const errors = [];

        if (!name) errors.push("Please enter a name");
        if (!email) errors.push("Please enter an email");
        if (!PhoneNumber) errors.push("Please enter a contact number");
        if (!Password || Password.length < 6) errors.push("Please enter a password with at least 6 characters");

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ success: false, message: "Email is already registered" });
            } else {


                const { otp, expiresAt } = generateOtp(6, 120000)
                existingUser.otp = otp
                existingUser.Password = Password
                existingUser.expiresAt = expiresAt

                const emailContent = {
                    email: email,
                    subject: "Verify Your Email Address",
                    message: `Hello ${name},\n\n` +
                        `Your password has been updated. Please verify your email address using the OTP below:\n\n` +
                        `OTP: ${otp}\n` +
                        `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n` +
                        `Please verify your email address by clicking the link below:\n\n`,
                };
                await sendEmail(emailContent);
                await existingUser.save()
                return res.status(200).json({ success: true, message: "A new verification email has been sent. Please check your inbox." });
            }
        }

        const { otp, expiresAt } = generateOtp(6, 120000)
        // const image = `https://ui-avatars.com/api/?background=random&name=${name}`
        const newUser = new User({
            // Gender,
            name,
            email,
            otp,
            expiresAt,
            PhoneNumber,
            Password,
            cPassword,
        });

        const emailContent = {
            email: email,
            subject: "Welcome to Our Service - Verify Your Email",
            message: `Hello ${name},\n\n` +
                `Thank you for registering with us! To complete your registration, please verify your email address using the OTP below:\n\n` +
                `OTP: ${otp}\n` +
                `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n` +
                `After verifying your email, you'll be all set to enjoy our services!\n\n` +
                `Best regards,\nYour Service Team\n\n`,
        };
        await sendEmail(emailContent);
        await newUser.save();

        res.status(201).json({ success: true, data: newUser.expiresAt, message: "User registered successfully! Please check your email for verification." });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { type } = req.params;
        // console.log("body",req.body)
        const { email, otp, password } = req.body;
        // console.log("otp",otp)

        // Check if the account is a user
        let account = await User.findOne({ email });
        let accountType = "User";

        // If user not found, check if it's a provider
        if (!account) {
            account = await Provider.findOne({ email });
            accountType = "Provider";
        }

        if (!account) {
            return res.status(404).json({ success: false, message: `${accountType} account not found with that email.` });
        }

        let accountOtp, otpExpiresAt, verificationMessage;

        if (type === 'email' && accountType === "User") {
            accountOtp = account.otp;
            otpExpiresAt = account.expiresAt;
            verificationMessage = "Email verified successfully.";
        } else if (type === 'password') {
            accountOtp = account.resetPasswordOtp;
            console.log("account", account)
            otpExpiresAt = account.resetPasswordExpiresAt;
            verificationMessage = "OTP verified for password reset.";
        } else {
            return res.status(400).json({ success: false, message: "Invalid verification type or unauthorized email verification for providers." });
        }

        if (accountOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        if (Date.now() > otpExpiresAt) {
            return res.status(400).json({ success: false, message: "OTP has expired." });
        }

        if (type === 'email') {
            account.isVerified = true;
            account.otp = null;
            account.expiresAt = null;
        } else if (type === 'password') {
            account.Password = password;
            account.resetPasswordOtp = null;
            account.resetPasswordExpiresAt = null;
        }

        await account.save();

        // return res.status(200).json({ success: true, message: verificationMessage });
        await sendToken(account, res, 200, verificationMessage)
    } catch (error) {
        console.error("Error during verification:", error);
        return res.status(500).json({ success: false, message: "An error occurred during verification." });
    }
};


exports.resendOtp = async (req, res) => {
    try {
        const { type } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email." });
        }

        let account = await User.findOne({ email });
        let accountType = "User";

        if (!account) {
            account = await Provider.findOne({ email });
            accountType = "Provider";
        }

        if (!account) {
            return res.status(404).json({ success: false, message: `${accountType} account not found with that email.` });
        }

        const { otp, expiresAt } = generateOtp(6, 120000);
        let emailContent;

        if (type === 'email') {
            if (account.isVerified) {
                return res.status(400).json({ success: false, message: "Email is already verified." });
            }
            account.otp = otp;
            account.expiresAt = expiresAt;

            emailContent = {
                email: email,
                subject: "Verify Your Email Address",
                message: `Hello ${account.name},\n\n` +
                    `Please verify your email address using the OTP below:\n\n` +
                    `OTP: ${otp}\n` +
                    `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n` +
                    `Thank you for joining us!`,
            };
        } else if (type === 'password') {
            account.resetPasswordOtp = otp;
            account.resetPasswordExpiresAt = expiresAt;

            emailContent = {
                email: email,
                subject: "Password Reset Verification OTP",
                message: `Hello ${account.name},\n\n` +
                    `You requested to reset your password. Use the OTP below to verify your request:\n\n` +
                    `OTP: ${otp}\n` +
                    `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n` +
                    `If you did not request a password reset, please ignore this email.`,
            };
        } else {
            return res.status(400).json({ success: false, message: "Invalid resend type." });
        }

        // Send the email and save the updated OTP and expiration
        await sendEmail(emailContent);
        await account.save();

        return res.status(200).json({ success: true, message: `A new OTP has been sent to your email.` });

    } catch (error) {
        console.error("Error during OTP resend:", error);
        return res.status(500).json({ success: false, message: "An error occurred while resending OTP. Please try again later." });
    }
};


exports.updateProfile = async (req, res) => {
    // console.log("object")
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, email, PhoneNumber } = req.body;
        // const { ProfileImage } = req.file;

        const updateFields = {};

        if (req.file) {
            const { imageUrl, public_id } = await uploadToCloudinary(req.file.buffer)
            updateFields.ProfileImage = {
                imageUrl: imageUrl,
                public_id: public_id
            }
        }

        if (name) {
            updateFields.name = name;
        }
        if (email) updateFields.email = email;
        if (PhoneNumber) updateFields.PhoneNumber = PhoneNumber;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};


exports.login = async (req, res) => {
    try {
        
        const { any, password } = req.body;
        // console.log(req.body)
        if (!any || !password) {
            return res.status(400).json({ success: false, message: "Please provide both your email/phone number and password." });
        }

        // First, try finding the user in the User collection
        let user = await User.findOne({
            $or: [{ email: any }, { PhoneNumber: any }]
        });

        let isProvider = false;

        // If not found in User, try finding the provider in the Provider collection
        if (!user) {
            user = await Provider.findOne({
                $or: [{ email: any }, { mobileNumber: any }]
            });
            isProvider = true; // Flag to indicate a provider login
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No account found with that email/phone number${isProvider ? " for provider" : " for user"}.`
            });
        }

        // Check if the password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please try again." });
        }

        // If the user's email is not verified
        // if (!user.isVerified) {
        //     const { otp, expiresAt } = generateOtp(6, 120000);
        //     user.otp = otp;
        //     user.expiresAt = expiresAt;

        //     const emailContent = {
        //         email: user.email || user.profileData.email,
        //         subject: "Verify Your Email Address",
        //         message: `Hello,\n\n` +
        //             `It seems your email address is not verified yet. We need you to verify your email address. Please use the OTP below:\n\n` +
        //             `OTP: ${otp}\n` +
        //             `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n` +
        //             `Thank you for being with us! Please verify your email address and enjoy our services.\n`,
        //     };

        //     await sendEmail(emailContent);
        //     await user.save();
        //     return res.status(200).json({
        //         success: true,
        //         message: "We've sent you a verification email. Please check your inbox!"
        //     });
        // }

        // If the user or provider is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Your ${isProvider ? "provider" : "user"} account has been banned. Please contact our support team.`
            });
        }

        // Send token and login success message
        await sendToken(user, res, 200, `Login successful! Welcome back, ${isProvider ? "Provider" : "User"}!`);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "An error occurred during login. Please try again later." });
    }
};


exports.logout = (req, res) => {
    try {

        res.cookie("token", "", { expires: new Date(0), httpOnly: true });
        res.status(200).json({ success: true, message: "Logout successful. You have been logged out." });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "An error occurred during logout. Please try again later." });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        // console.log("body",req.body)
        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide your email address." });
        }

        let user = await User.findOne({ email });
        let isProvider = false;

        if (!user) {
            // console.log("i am in provider")
            user = await Provider.findOne({ email });
            // console.log("i am in provider",user)
            isProvider = true;
        }


        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No account found with that email address${isProvider ? " for provider" : " for user"}.`
            });
        }

        const { otp, expiresAt } = generateOtp(6, 120000);
        user.resetPasswordOtp = otp;
        user.resetPasswordExpiresAt = expiresAt;

        const emailContent = {
            email: email,
            subject: "Password Reset Request",
            message: `Hello,\n\n` +
                `We received a request to reset the password for your ${isProvider ? "provider" : "user"} account. Please use the OTP below to proceed with your password reset:\n\n` +
                `OTP: ${otp}\n` +
                `This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).\n\n`,
        };

        await sendEmail(emailContent);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "A password reset email has been sent. Please check your inbox for further instructions."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during the password reset process. Please try again later."
        });
    }
};


//==============Admin Works ==================//
exports.getAllUsers = async (req, res) => {
    try {
        const { isBanned, isVerified, PhoneNumber, email, Gender } = req.query;

        const filter = {};
        if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (PhoneNumber) filter.PhoneNumber = PhoneNumber;
        if (email) filter.email = email;
        if (Gender) filter.Gender = Gender;

        const users = await User.find(filter).select('-Password');

        res.status(200).json({ success: true, data: users })
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving users." });
    }
};

exports.getSingleUserById = async (req, res) => {
    try {
        // console.log(id)
        const userId = req.params.id;
        const user = await User.findById(userId).select('-Password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving the user." });
    }
};

exports.getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-Password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving the user." });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the account" });
    }
};

exports.banUserToggle = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBanned = !user.isBanned; // Toggle the isBanned status
        await user.save();

        const status = user.isBanned ? "banned" : "unbanned";
        res.status(200).json({ success: true, message: `User has been ${status} successfully` });
    } catch (error) {
        console.error("Error toggling ban status:", error);
        res.status(500).json({ success: false, message: "An error occurred while toggling ban status" });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                error: "User not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "User found",
            data: user
        });
    } catch (error) {
        console.log("Internal server error in getting user by id", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.createPayment = async (req, res) => {
    try {
        // console.log("i create payment start")
        const { userId } = req.params;
        const { price } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                error: "User not found",
            })
        }
        if (!price) {
            return res.status(400).json({
                success: false,
                message: "Price is required",
                error: "Price is required"
            })
        }
        if (price === 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be zero",
                error: "Price cannot be zero"
            })
        }

        const razorpayOptions = {
            amount: price * 100 || 5000000,
            currency: 'INR',
            payment_capture: 1,
        };

        const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions);

        if (!razorpayOrder) {
            return res.status(500).json({
                success: false,
                message: 'Error in creating Razorpay order',
            });
        }
        // console.log("create payment end")
        user.razorpayOrderId = razorpayOrder.id

        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Razorpay order created successfully',
            data: {
                user,
                razorpayOrder,
            }
        });


    } catch (error) {
        console.log("Internal server error in doing payment", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.PaymentVerify = async (req, res) => {
    try {
        // console.log("payment verify start")
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Validate request body
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
            });
        }

        // Generate signature for verification
        const genreaterSignature = validatePaymentVerification({ "order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);

        // console.log("aIM7S3NfvUHlM84tcZRQpNht",process.env.RAZORPAY_KEY_SECRET)

        // console.log("genreaterSignature",genreaterSignature)

        if (!genreaterSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await axios.get(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            auth: {
                username: process.env.RAZORPAY_KEY_ID,
                password: process.env.RAZORPAY_KEY_SECRET,
            },
        });

        const { method, status, amount } = paymentDetails.data;
        const currentTime = new Date().toISOString(); // Get current timestamp

        // console.log("id",razorpay_order_id)
        // Find the order in the database
        const findOrder = await User.findOne({ razorpayOrderId: razorpay_order_id });
        if (!findOrder) {
            return res.status(400).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // If payment is not successful, handle failure
        if (status !== 'captured') {
            const failedAmount = amount / 100; // Convert amount from paise to INR

            // Log failed payment with timestamp
            findOrder.rechargeHistory = findOrder.rechargeHistory || []; // Initialize if undefined
            findOrder.rechargeHistory.push({ amount: failedAmount, time: currentTime, transactionId: razorpay_payment_id, PaymentStatus: 'failed', paymentMethod: method });

            // Save updated order
            await findOrder.save();

            return res.redirect(
                `https://helpubuild.co.in/payment-failure?error=Payment failed via ${method || 'unknown method'}&transactionId=${razorpay_payment_id}&amount=${failedAmount}&date=${currentTime}`
            );
        }

        // Update payment details for successful payment
        // findOrder.transactionId = razorpay_payment_id;
        // findOrder.PaymentStatus = 'paid';
        // findOrder.paymentMethod = method;

        const previousWalletAmount = findOrder.walletAmount || 0; // Default to 0 if undefined
        const price = amount / 100; // Convert amount from paise to INR
        findOrder.walletAmount = previousWalletAmount + price;

        // Log successful payment with timestamp
        findOrder.rechargeHistory = findOrder.rechargeHistory || []; // Initialize if undefined
        findOrder.rechargeHistory.push({ amount: price, time: currentTime, transactionId: razorpay_payment_id, PaymentStatus: 'paid', paymentMethod: method });

        // Save updated order
        await findOrder.save();
        // console.log("payment verify end")

        // return res.status(200).json({
        //     success: true,
        //     message: 'Payment verified and wallet updated successfully',
        //     data: {
        //         transactionId: razorpay_payment_id,
        //         walletAmount: findOrder.walletAmount,
        //         rechargeHistory: findOrder.rechargeHistory,
        //     },
        // });
        return res.redirect(`https://helpubuild.co.in/successfull-recharge?amount=${price}&transactionId=${razorpay_payment_id}&date=${currentTime}`)
    } catch (error) {
        console.log('Internal server error', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.chatStart = async (userId, astrologerId) => {
    try {
        // console.log("userId", userId)
        // console.log("astrologerId", astrologerId)
        const user = await User.findById(userId)
        const provider = await Provider.findById(astrologerId)
        if (!user) {
            return {
                success: false,
                message: 'User is not found',
                error: 'User is not found'
            }
        }
        if (!provider) {
            return {
                success: false,
                message: 'Provider is not found',
                error: 'Provider is not found'
            }
        }

        if (user?.role !== 'user') {
            return {
                success: true,
                message: 'Chat started',
                error: 'Chat started',
            };
        }

        const walletAmount = user?.walletAmount;
        const providerWalletAmount = provider?.walletAmount;
        const providerPricePerMin = provider?.pricePerMin;
        if (walletAmount < providerPricePerMin) {
            return {
                success: false,
                message: 'Your wallet amount is too low. Please recharge your wallet.',
                error: 'Your wallet amount is too low. Please recharge your wallet.'
            }
        }
        // Generate a unique ObjectId for the new chat transition
        const newChatTransitionId = new mongoose.Types.ObjectId();

        const chatTimingRemaining = Math.floor(walletAmount / providerPricePerMin);
        const currentTime = new Date().toISOString();
        user.chatTransition = user.chatTransition || []; // Initialize if undefined
        provider.chatTransition = provider.chatTransition || []; // Initialize if undefined
        const newChatTransition = {
            _id: newChatTransitionId,
            startChatTime: currentTime,
            startingChatAmount: walletAmount,
            providerPricePerMin: providerPricePerMin,
            chatTimingRemaining: chatTimingRemaining,
            provider: provider._id,
        };
        const newChatTransitionProvider = {
            _id: newChatTransitionId,
            startChatTime: currentTime,
            startingChatAmount: providerWalletAmount,
            providerPricePerMin: providerPricePerMin,
            chatTimingRemaining: chatTimingRemaining,
            user: user._id,
        };
        user.chatTransition.push(newChatTransition);
        provider.chatTransition.push(newChatTransitionProvider);

        user.lastChatTransitionId = newChatTransitionId;
        provider.lastChatTransitionId = newChatTransitionId;

        // console.log("newChatTransition", newChatTransition)

        await user.save();
        await provider.save();

        return {
            success: true,
            message: 'Chat Stated Successfully',
            data: {
                chatTimingRemaining: chatTimingRemaining,
                chatTransition: newChatTransition,
                lastChatTransitionId: user.lastChatTransitionId,
            }
        }

    } catch (error) {
        console.error('Error in createChatRoom:', error);
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
}

exports.chatEnd = async (userId, astrologerId) => {
    try {
        // First, find the user by userId
        const findUser = await User.findById(userId);
        if (!findUser) {
            return {
                success: false,
                message: 'User not found',
                error: 'User not found',
            };
        }

        const findProvider = await Provider.findById(astrologerId);
        if (!findProvider) {
            return {
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            };
        }

        // Check if the user is a provider, in which case we should find the provider
        let user;
        if (findUser.role === 'provider') {
            const findProvider = await Provider.findById(astrologerId);
            if (!findProvider) {
                return {
                    success: false,
                    message: 'Provider not found',
                    error: 'Provider not found',
                };
            }
            user = findProvider;  // Set user to the provider object
        } else {
            user = findUser;  // Set user to the regular user object
        }

        // Ensure the user has an active chat to end (check lastChatTransitionId)
        if (!user.lastChatTransitionId) {
            return {
                success: false,
                message: 'No active chat transition ID found',
                error: 'No active chat transition ID found',
            };
        }

        // Find the last chat transition
        const lastTransition = user.chatTransition.find(
            (transition) => transition._id.toString() === user.lastChatTransitionId.toString()
        );

        // Find the last chat transition
        const providerLastTransition = findProvider.chatTransition.find(
            (transition) => transition._id.toString() === findProvider.lastChatTransitionId.toString()
        );

        if (!lastTransition) {
            return {
                success: false,
                message: 'No active chat found to end in user',
                error: 'No active chat found to end in user',
            };
        }

        if (!providerLastTransition) {
            return {
                success: false,
                message: 'No active chat found to end in provider',
                error: 'No active chat found to end in provider',
            };
        }

        // Calculate the chat end details
        const endTime = new Date();
        const durationSeconds = Math.ceil((endTime - new Date(lastTransition.startChatTime)) / 1000); // Duration in seconds

        // Convert the provider price from per minute to per second (in paise)
        const pricePerSecondInPaise = lastTransition.providerPricePerMin * 100 / 60;

        // Calculate the wallet deduction based on duration in seconds
        const walletUsedInPaise = Math.min(durationSeconds * pricePerSecondInPaise, user.walletAmount * 100); // user.walletAmount is in rupees, so multiply by 100 to convert to paise

        // Set the chat ending details
        lastTransition.endingChatTime = endTime.toISOString();
        lastTransition.endingChatAmount = (user.walletAmount * 100 - walletUsedInPaise) / 100; // Deducted amount in rupees
        user.walletAmount -= walletUsedInPaise / 100;  // Deduct wallet amount for chat duration (converted back to rupees)
        user.lastChatTransitionId = null;
        lastTransition.deductionAmount = walletUsedInPaise / 100;
        lastTransition.Date = endTime

        // Set the chat ending details
        providerLastTransition.endingChatTime = endTime.toISOString();
        // providerLastTransition.endingChatAmount = (user.walletAmount * 100 - walletUsedInPaise) / 100; // Deducted amount in rupees
        findProvider.walletAmount += walletUsedInPaise / 100;  // Deduct wallet amount for chat duration (converted back to rupees)
        findProvider.lastChatTransitionId = null;
        providerLastTransition.deductionAmount = walletUsedInPaise / 100;
        providerLastTransition.Date = endTime

        // Save the updated user data
        await user.save();
        await findProvider.save();

        return {
            success: true,
            message: 'Chat ended successfully',
            data: {
                duration: durationSeconds,
                walletUsedInPaise, // Wallet used in paise
                remainingWallet: user.walletAmount, // Remaining wallet in rupees
            },
        };
    } catch (error) {
        console.error('Error in chatEnd:', error);
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
};



