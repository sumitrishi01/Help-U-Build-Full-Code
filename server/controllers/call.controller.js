const User = require('../models/user.Model');
const Provider = require('../models/providers.model');
require('dotenv').config();
const axios = require('axios');

const CallApiKey = process.env.CALL_API_KEY;
const CallApiToken = process.env.CALL_API_TOKEN;
const CallAccountSid = process.env.CALL_ACCOUNT_SID;
const CallSubdomain = process.env.CALL_SUBDOMAIN;
const ExoPhone = process.env.EXO_PHONE;

exports.createCall = async (req, res) => {
    try {
        const { providerId, userId } = req.body;
        if (!providerId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Provider ID and User ID are required"
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

        const userNumber = user?.PhoneNumber;
        const providerNumber = provider?.mobileNumber;

        const callUrl = `https://${CallSubdomain}/v1/Accounts/${CallAccountSid}/Calls/connect.json`;
        const auth = Buffer.from(`${CallApiKey}:${CallApiToken}`).toString('base64');

        const formBody = new URLSearchParams({
            From: userNumber,
            To: providerNumber,
            CallerId: ExoPhone,
            StatusCallback: 'https://api.helpubuild.co.in/api/v1/call_status',
            StatusCallbackContentType: 'application/json',
            StatusCallbackEvents: ['terminal', 'answered'],
            Record: "true"
        }).toString();

        "hello"

        const response = await axios.post(callUrl, formBody, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        const callData = response.data.Call;

        console.log("Call Initiated:", callData);

        res.status(200).json({
            success: true,
            message: "Call initiated successfully",
            callDetails: {
                callSid: callData.Sid,
                status: callData.Status,
                recordingUrl: callData.RecordingUrl || "Recording will be available after the call"
            }
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
        const callStatus = req.body;
        console.log("Call Status Update:", callStatus);

        res.status(200).json({
            success: true,
            message: "Call status received",
            data: callStatus
        });

    } catch (error) {
        console.error("Error receiving call status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update call status"
        });
    }
};
