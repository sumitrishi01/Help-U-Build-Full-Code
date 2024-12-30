import React, { useEffect, useState } from 'react'
import { GetData } from '../../../utils/sessionStoreage';
import axios from 'axios';
import toast from 'react-hot-toast';

function UpdateServices() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const UserId = UserData?._id;

    const [formData, setFormData] = useState({
        service: []
    });

    const [loading, setLoading] = useState(false);

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...formData.service];
        updatedServices[index][field] = value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            service: updatedServices
        }));
    };

    const handleAddService = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            service: [...prevFormData.service, { name: '', price: '' }]
        }));
    };

    const handleRemoveService = (index) => {
        const updatedServices = formData.service.filter((_, i) => i !== index);
        setFormData((prevFormData) => ({
            ...prevFormData,
            service: updatedServices
        }));
    };

    const handleFetchProvider = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `https://api.helpubuild.co.in/api/v1/get-single-provider/${UserId}`
            );
            const allData = data.data;
            setFormData({
                service: allData.service || []
            });
        } catch (error) {
            console.log('Error fetching provider data', error);
            toast.error('Failed to fetch profile data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            const response = await axios.put(
                `https://api.helpubuild.co.in/api/v1/update-provider-profile/${UserId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // console.log('Update Response:', response.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.log('Error updating profile:', error.response?.data || error.message);
            toast.error(error?.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        handleFetchProvider();
    }, []);

    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">Services</h1>
            <form onSubmit={handleSubmit} className="card p-4">

                <div className="mb-3">
                    <label className="form-label">Services</label>
                    {formData.service.map((service, index) => (
                        <div key={index} className="row mb-2">
                            <div className="col-md-5">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Service Name"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="col-md-5">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Service Price"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveService(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddService}
                    >
                        Add Service
                    </button>
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

export default UpdateServices
