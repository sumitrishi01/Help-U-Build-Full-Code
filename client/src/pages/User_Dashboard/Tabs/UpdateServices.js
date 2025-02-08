import React, { useEffect, useState } from 'react';
import { GetData } from '../../../utils/sessionStoreage';
import axios from 'axios';
import toast from 'react-hot-toast';

function UpdateServices() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const UserId = UserData?._id;

    const [selectedCategory, setSelectedCategory] = useState('Residential'); // Default category
    const [formData, setFormData] = useState({
        category: 'Residential',
        conceptDesignWithStructure: '0',
        buildingServiceMEP: '0',
        workingDrawing: '0',
        interior3D: '0',
        exterior3D: '0',
    });
    const [loading, setLoading] = useState(false);
    
    const handleFetchProvider = async () => {
        setLoading(true);
        try {
            // Send the selected category along with providerId to the backend
            const { data } = await axios.get(
                `http://localhost:5000/api/v1/get-service-by-provider/${UserId}/${selectedCategory}`
            );
            
    
            // Find the service data for the selected category
            const serviceData = data.data.find(
                (service) => service.category === selectedCategory
            );
    
            if (serviceData) {
                // Set the form data based on the service data
                setFormData({
                    category: serviceData.category,
                    conceptDesignWithStructure: serviceData.conceptDesignWithStructure || '',
                    buildingServiceMEP: serviceData.buildingServiceMEP || '',
                    workingDrawing: serviceData.workingDrawing || '',
                    interior3D: serviceData.interior3D || '',
                    exterior3D: serviceData.exterior3D || '',
                });
            }

        } catch (error) {
            console.log('Error fetching provider data', error);
            setFormData({
                category: selectedCategory,
                conceptDesignWithStructure: '',
                buildingServiceMEP: '',
                workingDrawing: '',
                interior3D: '',
                exterior3D: '',
            });
            // toast.error('Failed to fetch profile data.');
        } finally {
            setLoading(false);
        }
    };
    
    // Trigger the fetch function whenever category changes
    useEffect(() => {
        handleFetchProvider();
    }, [selectedCategory]); // Re-fetch when category changes
    

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setFormData((prev) => ({
            ...prev,
            category,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const finalData = {
            ...formData,
            provider: UserId,
            };
        try {
            await axios.put(
                `http://localhost:5000/api/v1/update-provider-service/${UserId}`,
                finalData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
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
    }, [selectedCategory]); // Refetch data when the category changes

    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">Update Services</h1>
            <form onSubmit={handleSubmit} className="card p-4">
                <div className="mb-3">
                    <label className="form-label">Category</label>
                    <div>
                        {['Residential', 'Commercial', 'Landscape'].map((category) => (
                            <label key={category} className="me-3">
                                <input
                                    type="radio"
                                    name="category"
                                    value={category}
                                    checked={selectedCategory === category}
                                    onChange={() => handleCategoryChange(category)}
                                    className="me-1"
                                />
                                {category}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Concept Design with Structure (per sq. ft.)</label>
                    <input
                        type="text"
                        name="conceptDesignWithStructure"
                        value={formData.conceptDesignWithStructure}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Building Service (MEP) (per sq. ft.)</label>
                    <input
                        type="text"
                        name="buildingServiceMEP"
                        value={formData.buildingServiceMEP}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Working Drawing (per sq. ft.)</label>
                    <input
                        type="text"
                        name="workingDrawing"
                        value={formData.workingDrawing}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Interior 3D (per sq. ft.)</label>
                    <input
                        type="text"
                        name="interior3D"
                        value={formData.interior3D}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Exterior 3D (per sq. ft.)</label>
                    <input
                        type="text"
                        name="exterior3D"
                        value={formData.exterior3D}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Update Service'}
                </button>
            </form>
        </div>
    );
}

export default UpdateServices;
