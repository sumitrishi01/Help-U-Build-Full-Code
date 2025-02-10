const axios = require("axios");

exports.fetchProviderData = async function (id) {
    try {
        const response = await axios.get(`http://localhost:5000/api/v1/provider_status/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching provider data:", error.message);
        return error?.response?.data || { success: false, message: "Unknown error occurred" };
    }
};
