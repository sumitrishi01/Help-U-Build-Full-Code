import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toast } from 'react-bootstrap';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';

function StatusPage() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const providerId = UserData?._id;
    const [statuses, setStatuses] = useState({
        chatStatus: "",
        callStatus: "",
        meetStatus: "",
    });

    const handleFetchProvider = async () => {
        try {
            const { data } = await axios.get(
                `https://try.helpubuild.co.in/api/v1/get-single-provider/${providerId}`
            );
            const allData = data.data;
            setStatuses({
                chatStatus: allData.chatStatus || '',
                callStatus: allData.callStatus || '',
                meetStatus: allData.meetStatus || ''
            });
        } catch (error) {
            console.log('Error fetching provider data', error);
            toast.error('Failed to fetch profile data.');
        }
    };

    useEffect(() => {
        handleFetchProvider();
    }, [])

    const handleToggle = async (statusType) => {
        const updatedStatus = !statuses[statusType];
        const previousStatuses = { ...statuses };
        setStatuses({ ...statuses, [statusType]: updatedStatus });
    
        try {
            const response = await axios.put(
                `https://try.helpubuild.co.in/api/v1/update-available-status/${providerId}`,
                { [statusType]: updatedStatus }
            );
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error('Failed to update status');
                setStatuses(previousStatuses); // Revert to previous state on failure
            }
        } catch (error) {
            console.log('Internal server error', error);
            toast.error('Error updating status');
            setStatuses(previousStatuses); // Revert to previous state on failure
        }
    };
    

    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">Provider Availability Status</h1>
            <div className="card p-4 shadow">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Chat Availability</span>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="chatStatus"
                            checked={statuses.chatStatus}
                            onChange={() => handleToggle('chatStatus')}
                        />
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Call Availability</span>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="callStatus"
                            checked={statuses.callStatus}
                            onChange={() => handleToggle('callStatus')}
                        />
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Meet Availability</span>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="meetStatus"
                            checked={statuses.meetStatus}
                            onChange={() => handleToggle('meetStatus')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatusPage;
