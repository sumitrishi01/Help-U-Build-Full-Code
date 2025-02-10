import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Forget() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitFirst = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://try.helpubuild.co.in/api/v1/forgot-password', { email, newPassword });

      if (response.data.success) {
        toast.success('OTP has been sent to your email!');
        setIsOtpSent(true);
      } else {
        toast.error(response.data.message || 'Something went wrong!');
      }
    } catch (err) {
      console.log("Real Api Error: " + err)
      toast.error(err?.response?.data?.message || 'Server error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://try.helpubuild.co.in/api/v1/Changepassword', { email, otp, password: newPassword });

      if (response.data.success) {
        toast.success('OTP verified successfully. Redirecting to login...');
        window.location.href = '/login';
      } else {
        toast.error(response.data.message || 'Invalid OTP, please try again.');
      }
    } catch (err) {
      await FallBackOtpSubmit(event)
      console.log("Real Api Error: " + err)

      // toast.error(err?.response?.data?.message || 'Verification failed, please try again.');
    } finally {
      setLoading(false);
    }
  };



  const FallBackOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Try Api Run: ")
    try {
      const response = await axios.post('https://try.helpubuild.co.in/api/v1/Changepassword', { email, otp, password: newPassword });

      if (response.data.success) {
        toast.success('OTP verified successfully. Redirecting to login...');
        window.location.href = '/login';
      } else {
        toast.error(response.data.message || 'Invalid OTP, please try again.');
      }
      console.log("Try Api Run response: ", response)

    } catch (err) {
      console.log("Try Api Run err: ", err)

      toast.error(err?.response?.data?.message || 'Verification failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3 className="text-center mb-4">Forgot Password</h3>
              {!isOtpSent ? (
                <form onSubmit={handleSubmitFirst}>
                  <div className="form-group mb-3">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group mb-3">
                    <label>New Password</label>
                    <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="7" />
                    <small className="text-danger">Password must be at least 7 characters long.</small>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Submit'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitOtp}>
                  <div className="form-group mb-3">
                    <label>Enter OTP</label>
                    <input type="text" className="form-control" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Verify OTP'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forget;
