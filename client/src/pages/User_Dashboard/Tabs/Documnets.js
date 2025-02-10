import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';

export const Documnets = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;

  const [memberData, setMemberData] = useState({
    qualificationProof: null,
    photo: null,
    adhaarCard: null,
    panCard: null,
  });
  const [uploadedImages, setUploadedImages] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch previously uploaded documents
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const { data } = await axios.get(
          `https://api.helpubuild.co.in/api/v1/get-single-provider/${UserId}`
        );
        const providerData = data.data;
        setUploadedImages({
          qualificationProof: providerData.qualificationProof?.imageUrl,
          photo: providerData.photo?.imageUrl,
          adhaarCard: providerData.adhaarCard?.imageUrl,
          panCard: providerData.panCard?.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching provider data', error);
        toast.error('Failed to fetch profile data.');
      }
    };
    fetchProvider();
  }, [UserId]);

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setMemberData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  // Create FormData object for file upload
  const makeFormData = () => {
    const formData = new FormData();
    Object.keys(memberData).forEach((key) => {
      if (memberData[key]) {
        formData.append(key, memberData[key]);
      }
    });
    return formData;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = makeFormData();
    setLoading(true);
    try {
      const res = await axios.put(
        `https://api.helpubuild.co.in/api/v1/update-provider-documents/${UserId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success(res.data.message || 'Documents updated successfully!');
    } catch (error) {
      console.error('Error updating documents:', error);
      toast.error(
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Failed to update documents. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-center mb-4">Upload Documents</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
        {['qualificationProof', 'photo', 'adhaarCard', 'panCard'].map((field) => (
          <div className="mb-4" key={field}>
            <label htmlFor={field} className="form-label text-capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            {uploadedImages[field] && (
              <div className="mb-2">
                <img
                  src={uploadedImages[field]}
                  alt={`${field} preview`}
                  className="img-thumbnail"
                  style={{ maxHeight: '150px', maxWidth: '150px' }}
                />
              </div>
            )}
            <input
              type="file"
              name={field}
              id={field}
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
        ))}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            'Upload Documents'
          )}
        </button>
      </form>
    </div>
  );
};
