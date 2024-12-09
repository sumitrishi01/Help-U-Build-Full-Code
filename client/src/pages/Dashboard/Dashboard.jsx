import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import { toast } from 'react-hot-toast';
import './userdashboard.css';
import Settings from './Settings';

function Dashboard() {
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings')
  const Data = GetData('user')
  const UserData = JSON.parse(Data)
  const userId = UserData._id
  const token = GetData('token');
  // console.log(token)

  const GetMyProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log("data: ", data.data)
      setMyProfile(data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    GetMyProfile();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear()
    window.location.href = '/'
  }

  if (loading || !myProfile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='userdashboard-body-bg'>
        <div className="w-75 mx-auto py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-12">
              <div className="card profile-card-header" style={{ borderRadius: 15 }}>
                <div className="card-body p-4">
                  <div className=' d-flex justify-content-between'>
                    <div>
                      <div style={{ alignItems: 'center' }} className='d-flex mb-2'>
                        <a href="#!">
                          <img
                            src={myProfile.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name || 'User')}&background=random`}
                            alt="avatar"
                            className="img-fluid d-flex object-cover rounded-circle me-3"
                            style={{
                              width: '80px',
                              height: '80px',
                            }}
                          />
                        </a>
                        <h3 className=" p-0 m-0">{myProfile.name}</h3>
                      </div>
                      <p className="small mb-0">
                        <i className="fas fa-star fa-lg text-warning" />{" "}
                        {/* <span className="mx-2">|</span> */}
                        {`${myProfile.email}`}
                        <span className="mx-2">|</span>
                        {`${myProfile.PhoneNumber}`}
                        {/* <span className="mx-2">|</span> */}
                      </p>
                    </div>
                    <div className=' d-flex align-items-center justify-content-center'>
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
                  <hr className="my-4" />

                  <div className="featured-list d-flex justify-content-start align-items-center">
                    <p onClick={() => setActiveTab('settings')} style={{ fontWeight: '700' }} className="mb-0 text-uppercase">
                      <i className="fas fa-cog me-2" />{" "}
                      <span style={{ cursor: 'pointer' }} className={`cursor-pointer ${activeTab === 'settings' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                        settings
                      </span>
                      <span className="ms-3 me-4">|</span>
                    </p>

                    {/* <button
                      type="button"
                      className="btn logout_btn mx-4 btn-sm btn-floating"
                      title="Logout"
                      onClick={() => handleLogout()}
                    >
                      Logout  <i className="fas fa-sign-out-alt text-body"></i>
                    </button> */}

                  </div>

                </div>
              </div>
            </div>
          </div>

          {
            activeTab === 'settings' && (
              <>
                <div className="w-100 py-4 mt-5 mb-3">
                  <h2>
                    <i className="fas fa-user-cog text-dark me-2" />
                    My Settings

                  </h2>

                  {/* Settings Form */}
                  <Settings data={myProfile} />

                </div>
              </>
            )
          }

        </div>
      </div>
    </>
  );
}

export default Dashboard;
