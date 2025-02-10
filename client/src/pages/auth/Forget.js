import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Forget() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state

  const fallBackFnc = async (e) => {
    e?.preventDefault?.(); // Prevent default if `e` exists
    setLoading(true);

    try {
        const response = await axios.post('https://try.helpubuild.co.in/api/v1/forgot-password', {
            email,
            newPassword,
        });

        if (response.data.success) {
            toast.success('Password update request successful. OTP has been sent to your email!');
            setMessage('Password update request successful. OTP has been sent to your email!');
            setError('');
            setIsOtpSent(true);
        } else {
            setError(response.data.message);
            setMessage('');
            setIsOtpSent(false);
        }
    } catch (err) {
        console.log("Fallback Error:", err);
        setError('An error occurred while processing your request. Please try again.');
        setMessage('');
    } finally {
        setLoading(false);
    }
};

const handleSubmitFirst = async (e) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
        toast.error('Please enter a valid email and new password.');
        return;
    }

    setLoading(true);

    try {
        const response = await axios.post('https://api.helpubuild.co.in/api/v1/forgot-password', {
            email,
            newPassword,
        });

        if (response.data.success) {
            toast.success('Password update request successful. OTP has been sent to your email!');
            setMessage('Password update request successful. OTP has been sent to your email!');
            setError('');
            setIsOtpSent(true);
        } else {
            setError(response.data.message);
            setMessage('');
            setIsOtpSent(false);
        }
    } catch (err) {
        console.log("Primary API Failed, trying fallback...");
        await fallBackFnc(); // Call fallback if the primary request fails
    }
};

  // Handle OTP form submission
  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        "https://api.helpubuild.co.in/api/v1/verify/password",
        {
          email,
          otp,
          password: newPassword
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("OTP verified successfully.");
        setMessage("OTP verified successfully. You can now reset your password.");
        setError("");
        window.location.href = "/login";
      } else {
        setError(response.data.message);
        setMessage("");
      }
    } catch (err) {
      setError("An error occurred while verifying the OTP. Please try again.");
      console.log("Internal server error", err);
      setMessage("");
    } finally {
      setLoading(false); // Stop loading
    }
  };


  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3 className="text-center mb-4">Forgot Password</h3>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              {!isOtpSent ? (
                // First form to submit email and new password
                <form onSubmit={handleSubmitFirst}>
                  <div className="form-group mb-3">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength="7"
                    />
                    <small className="text-danger">Password must be at least 7 characters long.</small>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </form>
              ) : (
                // OTP form to verify OTP
                <form onSubmit={handleSubmitOtp}>
                  <div className="form-group mb-3">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      className="form-control"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Verify OTP'
                    )}
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
