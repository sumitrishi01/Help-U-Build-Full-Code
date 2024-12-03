import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';

const Profile = () => {
  // const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
  //   positionOptions: {
  //     enableHighAccuracy: false,
  //   },
  //   userDecisionTimeout: 5000,
  // });
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;
  const role = UserData?.type

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    DOB: '',
    language: '',
    mobileNumber: '',
    coaNumber: '',
    // location: '',
    pricePerMin: '',
    bio: '',
    expertiseSpecialization: '',
    yearOfExperience: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleFetchProvider = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/get-single-provider/${UserId}`
      );
      const allData = data.data;
      setFormData({
        name: allData.name || '',
        email: allData.email || '',
        DOB: allData.DOB || '',
        language: allData.language || '',
        mobileNumber: allData.mobileNumber || '',
        coaNumber: allData.coaNumber || '',
        // location: allData.location || '',
        pricePerMin: allData.pricePerMin || '',
        bio: allData.bio || '',
        expertiseSpecialization: allData.expertiseSpecialization || '',
        yearOfExperience: allData.yearOfExperience || ''
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
      const payload = {
        ...formData,
        expertiseSpecialization: Array.isArray(formData.expertiseSpecialization)
          ? formData.expertiseSpecialization.join(', ')
          : formData.expertiseSpecialization,
      };

      const response = await axios.put(
        `http://localhost:5000/api/v1/update-provider-profile/${UserId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Update Response:', response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.log('Error updating profile:', error.response?.data || error.message);
      toast.error(
        error?.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    handleFetchProvider();
  }, []);

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
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="DOB" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="DOB"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="language" className="form-label">
              Language
            </label>
            <input
              type="text"
              className="form-control"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="mobileNumber" className="form-label">
              Mobile Number
            </label>
            <input
              type="text"
              className="form-control"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>
          {
            role === 'Architect' && (
              <div className="col-md-6">
                <label htmlFor="coaNumber" className="form-label">
                  COA Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="coaNumber"
                  name="coaNumber"
                  value={formData.coaNumber}
                  onChange={handleChange}
                />
              </div>
            )
          }

        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="pricePerMin" className="form-label">
              Price Per Minute
            </label>
            <input
              type="number"
              className="form-control"
              id="pricePerMin"
              name="pricePerMin"
              value={formData.pricePerMin}
              onChange={handleChange}
            />
          </div>
          {/* <div className="col-md-6 mb-3">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div> */}
          <div className="col-md-6">
            <label htmlFor="yearOfExperience" className="form-label">
              Year Of Experience
            </label>
            <input
              type="text"
              className="form-control"
              id="yearOfExperience"
              name="yearOfExperience"
              value={formData.yearOfExperience}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="expertiseSpecialization" className="form-label">
            Expertise/Specialization
          </label>
          <textarea
            className="form-control"
            id="expertiseSpecialization"
            name="expertiseSpecialization"
            value={formData.expertiseSpecialization}
            onChange={handleChange}
            rows="3"
          ></textarea>
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
  );
};

export default Profile;
