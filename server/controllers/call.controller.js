const User = require('../models/user.Model');
const Provider = require('../models/providers.model');
require('dotenv').config();
const axios = require('axios');
const CallHistory = require('../models/CallHistory');

exports.createCall = async (req, res) => {
    try {
        const { providerId, userId, UserWallet, ProviderProfileMin, max_duration_allowed } = req.body;
        if (!providerId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Provider ID and User ID are required"
            });
        }

        if (max_duration_allowed === 0) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance! You need at least ${ProviderProfileMin} to make a 1-minute call.`,
            });
        }


        const provider = await Provider.findById(providerId);
        const user = await User.findById(userId);

        if (!provider || !user) {
            return res.status(404).json({
                success: false,
                message: "Provider or User not found"
            });
        }
        if (user.walletAmount === 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance! Please deposit money to make a call."
            });
        }

        if (provider.isBanned) {
            return res.status(400).json({
                success: false,
                message: "This provider is banned due to suspicious activity.",
            });
        }

        if (!provider.isProfileComplete) {
            return res.status(400).json({
                success: false,
                message: "This provider's profile is incomplete. Please choose another provider to make a call.",
            });
        }


        const userNumber = user?.PhoneNumber;
        const providerNumber = provider?.mobileNumber;
        // console.log(providerNumber)
        // console.log("userNumber", userNumber)

        if (!userNumber || !providerNumber) {
            return res.status(400).json({
                success: false,
                message: "User or provider phone number is missing"
            });
        }

        const response = await axios.post(
            'https://apiv1.cloudshope.com/api/sendClickToCall',
            {
                from_number: userNumber,
                to_number: providerNumber,
                callback_url: "https://api.helpubuild.co.in/api/v1/call_status-call",
                callback_method: "POST",
                max_duration: max_duration_allowed

            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDSHOPE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const callData = response.data;
        const newCallData = new CallHistory({
            userId: userId,
            from_number: userNumber,
            to_number: providerNumber,
            providerId: providerId,
            callerId: callData.data?.campaignId,
            callStatus: callData.call_status,
            UserWallet: UserWallet,
            max_duration_allowed: max_duration_allowed,
        })

        await newCallData.save();
        return res.status(200).json({
            success: true,
            message: "Call initiated successfully",
            callDetails: newCallData
        });

    } catch (error) {
        console.error("Error creating call:", error);
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Failed to create call",
                error: error.response.data
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.call_status = async (req, res) => {
    try {

        const callStatusQuery = req.query;
        if (!callStatusQuery.from_number || !callStatusQuery.to_number) {
            return res.status(400).json({
                success: false,
                message: "Missing required call details (from_number or to_number)."
            });
        }

        const findHistory = await CallHistory.findOne({
            from_number: callStatusQuery.from_number,
            to_number: callStatusQuery.to_number,
        }).populate('userId').populate('providerId');

        if (!findHistory) {
            return res.status(404).json({
                success: false,
                message: "No call history found for the provided numbers."
            });
        }


        // Calculate talk time
        const startTime = parseInt(callStatusQuery.start_time);
        const endTime = parseInt(callStatusQuery.end_time);
        let talkTimeInSeconds = endTime - startTime;

        if (isNaN(startTime) || isNaN(endTime) || talkTimeInSeconds < 0) {
            talkTimeInSeconds = 0;
        }


        let talkTimeInMinutes = (talkTimeInSeconds / 60).toFixed(2);

        if (callStatusQuery?.status === 'FAILED') {
            findHistory.status = callStatusQuery.status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findHistory.TalkTime = (talkTimeInSeconds / 60).toFixed(2);
            await findHistory.save()
            return res.status(200).json({
                success: true,
                message: "Call failed",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }
        if (callStatusQuery?.to_number_status === "CANCEL") {
            findHistory.status = callStatusQuery.status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findHistory.to_number_status = callStatusQuery.to_number_status;
            findHistory.cancel_reason = 'Provider did not answer the call.';
            await findHistory.save();
            return res.status(200).json({
                success: true,
                message: "To Number Status Received successfully.",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }

        let HowManyCostOfTalkTime = 0;
        if (talkTimeInSeconds > 0) {
            if (talkTimeInSeconds < 60) {
                const num = Number(talkTimeInMinutes)
                HowManyCostOfTalkTime = num * findHistory.providerId?.pricePerMin;
            } else {
                HowManyCostOfTalkTime = talkTimeInMinutes * findHistory.providerId?.pricePerMin;
            }
            findHistory.providerId.walletAmount += Number(HowManyCostOfTalkTime);
            findHistory.userId.walletAmount -= Number(HowManyCostOfTalkTime);

            await findHistory.providerId.save();
            await findHistory.userId.save();
        }


        findHistory.status = callStatusQuery.status;
        findHistory.start_time = callStatusQuery.start_time;
        findHistory.end_time = callStatusQuery.end_time;
        findHistory.cost_of_call = HowManyCostOfTalkTime;
        findHistory.TalkTime = (talkTimeInSeconds / 60).toFixed(2);
        findHistory.money_deducetation_amount = HowManyCostOfTalkTime
        findHistory.recording_url = callStatusQuery.recording_url;
        await findHistory.save();

        return res.status(200).json({
            success: true,
            message: "Call status received successfully.",
            talkTime: {
                seconds: talkTimeInSeconds,
                minutes: talkTimeInMinutes
            },
            cost: HowManyCostOfTalkTime,
            callData: callStatusQuery,
            callHistory: findHistory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the call status.",
            error: error.message
        });
    }
};






