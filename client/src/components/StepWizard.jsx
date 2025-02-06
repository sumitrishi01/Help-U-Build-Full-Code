import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useGeolocated } from "react-geolocated";
import { setData } from "../utils/sessionStoreage";
import "./wizard.css";

const StepWizard = () => {
    const [memberData, setMemberData] = useState({
        name: "",
        email: "",
        type: "",
        mobileNumber: "",
        location: "",
        password: ""
    });
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { coords } = useGeolocated({ positionOptions: { enableHighAccuracy: false }, userDecisionTimeout: 5000 });

    useEffect(() => {
        if (coords) fetchCurrentLocation();
    }, [coords]);

    const fetchCurrentLocation = async () => {
        try {
            const res = await axios.post("https://api.helpubuild.co.in/Fetch-Current-Location", {
                lat: coords.latitude,
                lng: coords.longitude
            });
            setMemberData((prev) => ({ ...prev, location: res.data.data.address.completeAddress }));
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMemberData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePhone = () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(memberData.mobileNumber)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhone()) return;
        setLoading(true);
        try {
            const res = await axios.post("https://api.helpubuild.co.in/api/v1/register-provider", memberData);
            toast.success(res.data.message);
            setData("token", res.data.token);
            setData("islogin", !!res.data.token);
            setData("user", res.data.user);
            window.location.href = "/";
        } catch (error) {
            toast.error(error?.response?.data?.message || "Please try again later");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <form onSubmit={handleSubmit}>
                <div className="mb-5"><h1 className="text-center">Partner Registration</h1></div>
                <div className="row">
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" value={memberData.name} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={memberData.email} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Mobile Number</label>
                        <input type="tel" name="mobileNumber" value={memberData.mobileNumber} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Partner Type</label>
                        <select name="type" onChange={handleChange} value={memberData.type} className="form-control">
                            <option value="">Select Your Type</option>
                            <option value="Architect">Architect</option>
                            <option value="Interior">Interior Designer</option>
                            <option value="Vastu">Vastu Expert</option>
                        </select>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Location</label>
                        <input type="text" name="location" value={memberData.location} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <input type={isPasswordShow ? "text" : "password"} name="password" value={memberData.password} onChange={handleChange} className="form-control" />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsPasswordShow(!isPasswordShow)}>
                                <i className="far fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-success">{loading ? "Loading..." : "Register"}</button>
            </form>
        </div>
    );
};

export default StepWizard;
