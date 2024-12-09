import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import { useDropzone } from 'react-dropzone';
import Portfolio from './Portfolio';
import UploadGallery from './UploadGallery';
import { toast } from 'react-hot-toast';
import Settings from './Settings.js';
import './userdashboard.css';

const UserDashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reUploadTrue, setReUploadTrue] = useState(true);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);

  const [token, setToken] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Gallery')

  // Get token from session storage
  const GetToken = () => {
    const data = GetData('token');
    if (data) {
      setToken(data);
    }
  };

  const GetMyProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/GetMyProfile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log(data)
      setMyProfile(data.provider);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching profile:', error);
    }
  };

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };
  useEffect(() => {
    GetToken();
  }, []);

  useEffect(() => {
    if (token) {
      GetMyProfile(); // Fetch profile only if token exists
    }
  }, [token]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.pdf',
    maxFiles: 5,
    maxSize: 15 * 1024 * 1024,
  });

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append('PortfolioLink', file));

    setUploading(true);

    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/addPortfolio?type=Portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },

      });
      toast.success('Portfolio uploaded successfully');
      // console.log('Upload success:', response.data);
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear()
    window.location.href = '/'
  }

  if (!myProfile) {
    return <div className="container my-5 text-center">
      <div className="w-100">
        <img
          src="https://i.ibb.co/C56bwYQ/401-Error-Unauthorized-pana.png"
          alt="401 Unauthorized"
          className="img-fluid mx-auto d-block mb-4"
          style={{ maxWidth: '80%', height: 'auto' }}
        />
      </div>
      <p className="fs-4 text-muted">You are not authorized to view this page.</p>
      <a href="/login" className="btn btn-outline-danger as_btn btn-lg mt-3">
        <i className="fas fa-sign-in-alt me-2"></i>
        Login
      </a>
    </div>

  }
  return (
    <div className='userdashboard-body-bg'>
      <div className="w-75 mx-auto py-5 h-100 ">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-12">
            <div className="card  profile-card-header" style={{ borderRadius: 15 }}>
              <div className="card-body p-4">
                <div style={{ alignItems: 'center' }} className='d-flex mb-2'>
                  <a href="#!">
                    <img
                      src={myProfile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name || 'User')}&background=random`}
                      alt="avatar"
                      className="img-fluid d-flex object-cover rounded-circle me-3"
                      style={{
                        width: '80px',
                        height: '80px',
                      }}
                    />

                  </a>
                  <h3 className="mb-3">{myProfile.name}</h3>
                </div>
                <p className="small mb-0">
                  <i className="fas fa-star fa-lg text-warning" />{" "}<span>{myProfile?.type}</span>
                  <span className="mx-2">|</span>
                  {`₹ ${myProfile.pricePerMin}/min`} <span className="mx-2">|</span>

                  <span>{myProfile.language && myProfile.language.map((lang, index) => {
                    return (
                      <span key={index} className="archi-language-tag">
                        {lang}{index < myProfile.language.length - 1 ? ', ' : ''}
                      </span>
                    );
                  }) || ''}</span>
                  <span className="mx-2">|</span>
                  <span>{myProfile.expertiseSpecialization && myProfile.expertiseSpecialization.map((lang, index) => {
                    return (
                      <span key={index} className="archi-language-tag">
                        {lang}{index < myProfile.expertiseSpecialization.length - 1 ? ', ' : ''}
                      </span>
                    );
                  }) || ''}</span>
                </p>
                <hr className="my-4" />
                <div className="featured-list d-flex justify-content-start align-items-center">
                  <p onClick={() => setActiveTab('settings')} style={{ fontWeight: '700' }} className="mb-0 text-uppercase">
                    <i className="fas fa-cog me-2" />{" "}
                    <span style={{ cursor: 'pointer' }} className={`cursor-pointer ${activeTab === 'settings' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      settings
                    </span>
                  </p>
                  <p onClick={() => setActiveTab('Portfolio')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase">
                    <i className="fas fa-link ms-4 me-2" />{" "}
                    <span style={{ cursor: 'pointer' }} className={`cursor-pointer ${activeTab === 'Portfolio' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Portfolio
                    </span>
                  </p>

                  <p onClick={() => setActiveTab('Gallery')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase">
                    <i className="fas fa-ellipsis-h ms-4 me-2" />{" "}
                    <span style={{ cursor: 'pointer' }} className={`cursor-pointer ${activeTab === 'Gallery' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Gallery
                    </span>
                    <span className="ms-3 me-4">|</span>
                  </p>
                  <p>
                    <a href="#!">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-2.webp"
                        alt="avatar"
                        className="img-fluid rounded-circle user-thumb me-1"
                        width={35}
                      />
                    </a>
                    <a href="#!">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-3.webp"
                        alt="avatar"
                        className="img-fluid rounded-circle user-thumb me-1"
                        width={35}
                      />
                    </a>
                    <a href="#!">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-4.webp"
                        alt="avatar"
                        className="img-fluid rounded-circle user-thumb me-1"
                        width={35}
                      />
                    </a>
                    <a href="#!">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
                        alt="avatar"
                        className="img-fluid rounded-circle user-thumb me-3"
                        width={35}
                      />
                    </a>
                  </p>

                  <button
                    type="button"
                    className="btn logout_btn mx-4 btn-sm btn-floating"
                    title="Logout"
                    onClick={() => handleLogout()}
                  >
                    Logout  <i className="fas fa-sign-out-alt text-body"></i>
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>


        {activeTab === "Gallery" && (

          <div className="w-100 py-4 mt-4 mb-3">
            <div className='work-gallery-heading d-flex justify-content-between'>

              <div>
                <h2 className='work-gallery-heading'>
                  <i className="fas fa-lightbulb text-warning me-2" />
                  Your Work Gallery
                  {/* <hr /> */}
                </h2>
              </div>
              <div>
                <div className="add-gallery-btn text-end">
                  <button
                    onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                    className="btn btn-outline-danger btn-lg"
                  >
                    <i className="fas fa-image me-2"></i>
                    Add Gallery
                  </button>
                </div>
              </div>
            </div>
            <div>
              {/* Button to toggle gallery upload */}


              {/* Check if gallery upload is shown */}
              {showGalleryUpload ? (
                <UploadGallery isShow={showGalleryUpload} token={token} />
              ) : (
                <>
                  {/* Show Demo Gallery if no images exist */}
                  {(!myProfile?.portfolio?.GalleryImages || myProfile.portfolio.GalleryImages.length === 0) && (
                    <>
                      <h2 className="text-center text-primary mb-4">Demo Gallery</h2>
                      <div className="row">
                        {[
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Slides/1.webp",
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Square/1.webp",
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Vertical/1.webp",
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Slides/1.webp",
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Square/1.webp",
                          "https://mdbcdn.b-cdn.net/img/Photos/Thumbnails/Vertical/1.webp",
                        ].map((src, index) => (
                          <div key={index} className="col-12 col-md-4 mb-4">
                            <img
                              src={src}
                              alt={`Demo ${index + 1}`}
                              className="w-100 shadow-1-strong rounded custom-img-height"
                              style={{
                                maxHeight: "200px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className=" my-5">


                    {myProfile?.portfolio?.GalleryImages?.length > 0 ? (
                      <div className="row g-4">
                        {/* Large item (1st image) */}
                        <div className="col-md-8">
                          <div
                            className="bento-item bento-tall"
                            style={{
                              backgroundImage: `url(${myProfile.portfolio.GalleryImages[0]?.url || "placeholder-large.jpg"})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              height: "300px",
                              borderRadius: "8px",
                            }}
                          ></div>
                        </div>

                        {/* Two small items (2nd and 3rd images) */}
                        <div className="col-md-4">
                          <div className="row g-4">
                            {[1, 2].map((i) => (
                              <div key={i} className="col-12">
                                <div
                                  className="bento-item"
                                  style={{
                                    backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-small.jpg"})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    height: "140px",
                                    borderRadius: "8px",
                                  }}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Three medium items (4th, 5th, and 6th images) */}
                        {[3, 4, 5].map((i) => (
                          <div key={i} className="col-md-4">
                            <div
                              className="bento-item"
                              style={{
                                backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-medium.jpg"})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                height: "200px",
                                borderRadius: "8px",
                              }}
                            ></div>
                          </div>
                        ))}

                        {/* Remaining items (7th to 12th images) */}
                        {[6, 7, 8, 9, 10, 11].map((i) => (
                          <div key={i} className="col-md-4">
                            <div
                              className="bento-item"
                              style={{
                                backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-medium.jpg"})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                height: "200px",
                                borderRadius: "8px",
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Error Handling */
                      <div className="text-center">
                        <h3 className="text-danger">No images available in the gallery!</h3>
                        <p className="text-muted">Please upload images to view them in your gallery.</p>
                      </div>
                    )}
                  </div>

                </>
              )}
            </div>

          </div>

        )}
        <>
          {activeTab === 'Portfolio' && (
            <div className="w-100 py-4 mt-5 mb-3">
              <div className='d-flex align-item-center justify-content-between'>
                <div>
                  <h2>
                    <i className="fas fa-briefcase text-primary me-2" />
                    My Portfolio
                  </h2>
                </div>
                <div>
                  {myProfile?.portfolio?.PortfolioLink && reUploadTrue === false && (
                    <>
                      <div className="text-end mt-4">
                        <button
                          onClick={() => setReUploadTrue(true)}
                          className="btn mb-3 btn-outline-danger btn-lg update-portfolio-btn"
                        >
                          <i className="fas fa-upload me-2"></i>
                          Update Portfolio
                        </button>
                      </div>

                    </>
                  )}
                </div>
              </div>
              {reUploadTrue === false && (
                <Portfolio fileUrl={myProfile?.portfolio?.PortfolioLink} />
              )}

              <div className=' col-md-12'>
                {
                  reUploadTrue && (
                    <>
                      <div style={{ marginTop: '-44px' }} className="text-end  ">
                        <button
                          onClick={() => setReUploadTrue(false)}
                          className="btn mb-3 btn-outline-info me-3 btn-lg view-portfolio-btn"
                        >
                          <i className="fas fa-eye me-2"></i>

                          View Portfolio
                        </button>
                        <button
                          onClick={handleUpload}
                          className="btn mb-3 btn-lg upload-portfolio-btn"

                          disabled={uploading || files.length === 0}
                        >
                          <i className="fas fa-upload me-2"></i>
                          {uploading ? 'Uploading...' : 'Upload Portfolio'}
                        </button>
                      </div>


                      <div
                        {...getRootProps()}
                        className="dropzone text-center border-3 border-primary p-5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-gray-100"
                        style={{
                          background: '#f7f7f7',
                          cursor: 'pointer',
                        }}
                      >
                        <input {...getInputProps()} />
                        <h5 className="text-muted mb-3">
                          Drag & drop your PDF here, or click to select files
                        </h5>
                        <p className="text-muted mb-4">Max file size: 10MB</p>
                        <i className="fas fa-cloud-upload-alt text-primary fa-4x mb-3" />
                        <p className="text-muted">Only PDF files are allowed</p>
                      </div>
                      <div className="mt-4">
                        {files.length > 0 && (
                          <div className="row">
                            {files.map((file, index) => (
                              <div key={index} className="col-12 col-md-4 mb-3">
                                <div className="card border-0 shadow-sm">
                                  <div className="card-body text-center">
                                    <i className="fas fa-file-pdf text-danger fa-3x mb-2"></i>
                                    <p className="card-text">{file.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )
                }


              </div>





            </div>
          )}
        </>

        {activeTab === "settings" && (
          <div className="w-100 py-4 mt-5 mb-3">
            <h2>
              <i className="fas fa-user-cog text-dark me-2" />
              My Settings

            </h2>

            {/* Settings Form */}
            <Settings data={myProfile} />

          </div>

        )}
      </div>
    </div>
  );
};

export default UserDashboard;
