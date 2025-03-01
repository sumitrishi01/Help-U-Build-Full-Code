import React, { useState } from 'react';
import './Settings.css';
import Profile from './Tabs/Profile';
import Documents from './Tabs/Documnets';
import Password from './Tabs/Password';
import StatusPage from './Tabs/StatusPage';
import BankDetail from './Tabs/BankDetail';
import UpdateServices from './Tabs/UpdateServices';
import { GetData } from '../../utils/sessionStoreage';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Settings = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const type = UserData?.type;
  const mobileNumber = UserData?.mobileNumber;

  let tabs;
  if (type === 'Vastu') {
    tabs = [
      { id: 1, title: 'Profile' },
      { id: 2, title: 'Documents' },
      { id: 3, title: 'Bank Detail' },
      { id: 4, title: 'Change Password' },
      { id: 5, title: 'Enquiry' },
      { id: 6, title: 'Availability Status' },
    ];
  } else {
    tabs = [
      { id: 1, title: 'Profile' },
      { id: 6, title: 'Update Service' },
      { id: 2, title: 'Documents' },
      { id: 3, title: 'Bank Detail' },
      { id: 4, title: 'Change Password' },
      { id: 5, title: 'Availability Status' },
    ];
  }

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleTabClick = async (id) => {
    if (id === 3 && !isOtpVerified) {
      await sendOtp();
    } else {
      setActiveTab(id);
    }
  };

  // Function to send OTP
  const sendOtp = async () => {
    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/otp_send_before_update', { mobileNumber });
      if (response.data.success) {
        setOtpSent(true);
        setTimeout(() => {
          document.getElementById('otpModal').style.display = 'block';
        }, 200);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Try again.');
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/verify_otp_before_update', { mobileNumber, otp });
      if (response.data.success) {
        setIsOtpVerified(true);
        setActiveTab(3); // Open BankDetail after OTP verification
        setOtpSent(false);
        setOtp('');
        closeOtpModal();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('OTP verification failed.');
    }
  };

  // Close OTP Modal
  const closeOtpModal = () => {
    document.getElementById('otpModal').style.display = 'none';
  };

  return (
    <>
      {/* Tab Navigation */}
      <ul className="nav w-100 mt-4 nav-pills mb-4 justify-content-evenly gap-2" id="ex1" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.id}>
            <a
              className={`nav-link border-outline-dark as_btn ${activeTab === tab.id ? 'active' : ''}`}
              href="#!"
              onClick={() => handleTabClick(tab.id)}
              role="tab"
              aria-controls={`ex3-tabs-${tab.id}`}
              aria-selected={activeTab === tab.id}
            >
              {tab.title}
            </a>
          </li>
        ))}
      </ul>

      {/* OTP Modal */}
      {otpSent && (
        <div id="otpModal" className="modal fade show" style={{ display: 'block' }} aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">OTP Verification</h4>
                <button type="button" className="btn-close" onClick={closeOtpModal}></button>
              </div>
              <div className="modal-body">
                <p>An OTP has been sent to your registered mobile number: <strong>{mobileNumber}</strong></p>
                <input
                  type="text"
                  className="form-control mt-2 border"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeOtpModal}>Cancel</button>
                <button className="btn btn-primary" onClick={verifyOtp}>Verify OTP</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 1 && <Profile />}
        {activeTab === 2 && <Documents />}
        {activeTab === 3 && isOtpVerified && <BankDetail />}
        {activeTab === 4 && <Password />}
        {activeTab === 5 && <StatusPage />}
        {activeTab === 6 && <UpdateServices />}
      </div>
    </>
  );
};

export default Settings;
