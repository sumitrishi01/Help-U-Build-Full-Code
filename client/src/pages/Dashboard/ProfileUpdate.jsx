import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GetData } from '../../utils/sessionStoreage';
import toast from 'react-hot-toast';

function ProfileUpdate() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const UserId = UserData?._id;
    const role = UserData?.type
    const token = GetData('token');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        PhoneNumber: '',
        Gender: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleFetchUser = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-user-by-id/${UserId}`)
            console.log(data.data)
            const allData = data.data;
            console.log("object",allData)
            setFormData({
                name: allData.name,
                email: allData.email,
                PhoneNumber: allData.PhoneNumber,
                Gender: allData.gender
            })
        } catch (error) {
            console.log("Internal server error in getting user data", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(
                `https://api.helpubuild.co.in/api/v1/user/update-profile`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.log("Internal server error in updating", error)
            toast.error(
                error?.response?.data?.message || 'Failed to update profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchUser();
    }, [])

    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">Profile</h1>
            <form onSubmit={handleSubmit} className="card p-4">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6 mt-2">
                        <label htmlFor="PhoneNumber" className="form-label">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="PhoneNumber"
                            name="PhoneNumber"
                            value={formData.PhoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </div>
    )
}

export default ProfileUpdate
