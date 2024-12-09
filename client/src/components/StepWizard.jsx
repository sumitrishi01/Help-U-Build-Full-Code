import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useGeolocated } from "react-geolocated";
import { setData } from "../utils/sessionStoreage";
import "./wizard.css";

const StepWizard = () => {
    const [activeStep, setActiveStep] = useState(1);
    const steps = [
        { id: 1, title: "Basic Details" },
        { id: 2, title: "Additional Information" },
    ];
    const [memberData, setMemberData] = useState({
        name: "",
        email: "",
        type: "",
        mobileNumber: "",
        gstDetails: "",
        coaNumber: "",
        location: "",
        password: "",
        // DOB: "",
        photo: null,
        adhaarCard: null,
        panCard: null,
        Qualification: "",
        qualificationProof: null,
    });
    // Save active step to localStorage
    const handleNext = () => {
        if (activeStep < steps.length) {
            const nextStep = activeStep + 1;
            setActiveStep(nextStep);
            localStorage.setItem("activeStep", nextStep);
        }
    };

    const handlePre = () => {
        if (activeStep > 1) { // Check if activeStep is greater than 1
            const prevStep = activeStep - 1;
            setActiveStep(prevStep);
            // localStorage.setItem("activeStep", prevStep);
        }
    };


    const handleStepClick = (step) => {
        if (step <= activeStep) {
            setActiveStep(step);
            localStorage.setItem("activeStep", step);
        }
    };
    // Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("memberData");
        const savedStep = localStorage.getItem("activeStep");

        if (savedData) {
            setMemberData(JSON.parse(savedData));
        }
        if (savedStep) {
            setActiveStep(Number(savedStep));
        }
    }, []);
    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
    });
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const fetchCurrentLocation = async () => {
        if (!coords) return;
        try {
            const res = await axios.post('https://api.helpubuild.co.in/Fetch-Current-Location', {
                lat: coords.latitude,
                lng: coords.longitude
            });
            const data = res.data.data.address;
            if (data) {
                setMemberData((prev) => ({ ...prev, location: data.completeAddress }));
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };
    useEffect(() => {
        if (coords) {
            fetchCurrentLocation();
        }
    }, [coords]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...memberData,
            [name]: value,
        };
        setMemberData(updatedData);
        localStorage.setItem("memberData", JSON.stringify(updatedData));
    };
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setMemberData((prev) => ({
            ...prev,
            [name]: files[0]
        }));
    };
    const validateAge = () => {
        if (parseInt(memberData.age) <= 22) {
            toast.error('Age must be greater than 22');
            return false;
        }
        return true;
    };
    const validatePhone = () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(memberData.mobileNumber)) {
            toast.error('Mobile number must be exactly 10 digits.');
            return false;
        }
        if (parseInt(memberData.age) <= 22) {
            toast.error('Age must be greater than 22.');
            return false;
        }
        return true;
    };
    const makeFormData = () => {
        const formData = new FormData();
        Object.keys(memberData).forEach((key) => {
            if (Array.isArray(memberData[key])) {
                formData.append(key, memberData[key].join(','));
            } else {
                formData.append(key, memberData[key]);
            }
        });
        return formData;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhone() || !validateAge()) return;
        setLoading(true);
        try {
            const res = await axios.post('https://api.helpubuild.co.in/api/v1/register-provider', makeFormData());
            toast.success(res.data.message);
            const { token, user } = res.data;
            localStorage.clear();
            setData('token', token);
            setData('islogin', token ? true : false)
            setData('user', JSON.stringify(user))
            window.location.href = "/"
        } catch (error) {
            console.error('Error during registration:', error);
            toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="container mt-5 mb-5">
            <div className="stepwizard">
                <div className="stepwizard-row setup-panel">
                    {steps.map((step) => (
                        <div key={step.id} className="stepwizard-step col-xs-3">
                            <button
                                type="button"
                                className={`btn btn-circle ${activeStep >= step.id ? "btn-success" : "btn-default"
                                    }`}
                                onClick={() => handleStepClick(step.id)}
                                disabled={activeStep < step.id}
                            >
                                {step.id}
                            </button>
                            <p>
                                <small>{step.title}</small>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <form role="form" className="" onSubmit={handleSubmit}>
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`panel panel-primary setup-content ${activeStep === step.id ? "d-block" : "d-none"
                            }`}
                    >
                        <div className="panel-heading">
                            <h3 className="panel-title">{step.title}</h3>
                        </div>
                        <div className="panel-body">
                            {step.id === 1 && (
                                <>
                                    <div className="row">
                                        <div className="col-lg-6 mb-3">
                                            <div className="d-flex flex-row">
                                                <i className="fas fa-user fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="name">
                                                        Name
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="name"
                                                        value={memberData.name}
                                                        type="text"
                                                        id="name"
                                                        className="form-control input-shape px-5"
                                                        placeholder="Enter Your Name"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 mb-3">
                                            <div className="d-flex flex-row">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="email"
                                                        value={memberData.email}
                                                        type="email"
                                                        id="email"
                                                        placeholder="Enter Your Email"
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 mb-3">
                                            <div className="d-flex flex-row">
                                                <i className="fas fa-phone fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="mobileNumber">
                                                        Mobile Number
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="mobileNumber"
                                                        value={memberData.mobileNumber}
                                                        type="tel"

                                                        id="mobileNumber"
                                                        placeholder="Enter Your Mobile Number"
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 mb-3">
                                            <div className="d-flex flex-row">
                                                <i className="fas fa-user fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="type">
                                                        Partner Type
                                                    </label>
                                                    <select
                                                        name="type"
                                                        onChange={handleChange}
                                                        className="form-control form-select input-shape px-5"
                                                        value={memberData.type}
                                                    >
                                                        <option>Select Your Type</option>
                                                        <option value="Architect">Architect</option>
                                                        <option value="Interior">Interior Designer</option>
                                                        <option value="Vastu">Vastu Experts</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 mb-3">
                                            <div className="d-flex flex-row">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw lable-icon" style={{ zIndex: '999' }} />
                                                <div className="form-outline flex-fill mb-0 position-relative">
                                                    <label className="form-label" htmlFor="password">
                                                        Password
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="password"
                                                        value={memberData.password}
                                                        type={isPasswordShow ? 'text' : 'password'}
                                                        id="password"
                                                        className="form-control input-shape px-5"
                                                    />
                                                    <span
                                                        type="button"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58%',
                                                            right: '2%',
                                                        }}
                                                        onClick={() => setIsPasswordShow(!isPasswordShow)}
                                                    >
                                                        <i style={{ color: '#032F61' }} className="far fa-eye"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step.id === 2 && (
                                <>
                                    <div className="row">
                                        {memberData.type === "Architect" && (
                                            <div className="col-lg-6 mb-3">
                                                <div className="d-flex flex-row">
                                                    <i className="fas fa-id-card fa-lg me-3 fa-fw lable-icon" />
                                                    <div className="form-outline flex-fill mb-0">
                                                        <label className="form-label" htmlFor="coaNumber">
                                                            COA Number
                                                        </label>
                                                        <input
                                                            onChange={handleChange}
                                                            name="coaNumber"
                                                            value={memberData.coaNumber}
                                                            type="text"
                                                            id="coaNumber"
                                                            className="form-control input-shape px-5"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-lg-6">
                                            <div className="d-flex flex-row mb-4">
                                                <i className="fas fa-book fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="Qualification">
                                                        Higher Education
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="Qualification"
                                                        value={memberData.Qualification}
                                                        type="text"
                                                        id="Qualification"
                                                        className="form-control input-shape px-5"
                                                        placeholder="eg: Diploma in Interior Design , etc"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="d-flex flex-row mb-4">
                                                <i className="fas fa-globe fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label">Location</label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={memberData.location}
                                                        onChange={handleChange}
                                                        placeholder='Write Your Current Location'
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="d-flex flex-row mb-4">
                                                <i className="fas fa-id-card fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label">Adhaar Card</label>
                                                    <input
                                                        type="file"
                                                        name="adhaarCard"
                                                        onChange={handleFileChange}
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="d-flex flex-row mb-4">
                                                <i className="fas fa-id-badge fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label">PAN Card</label>
                                                    <input
                                                        type="file"
                                                        name="panCard"
                                                        onChange={handleFileChange}
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="d-flex flex-row mb-4">
                                                <i className="fas fa-certificate fa-lg me-3 fa-fw lable-icon" />
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label">Qualification Proof</label>
                                                    <input
                                                        type="file"
                                                        name="qualificationProof"
                                                        onChange={handleFileChange}
                                                        className="form-control input-shape px-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <a
                                    type="button"
                                    className="btn btn-primary nextBtn pull-right me-2"
                                    onClick={handlePre}
                                    // onClick={() => handleStepClick(step.id)}
                                    disabled={handlePre === 1}
                                >Previous</a>
                                {activeStep < steps.length ? (
                                    <a
                                        type="button"
                                        className="btn btn-primary nextBtn pull-right"
                                        onClick={handleNext}
                                    >Next</a>
                                ) : (
                                    <button type="submit" className="btn btn-success pull-right">{loading ? 'Loading...' : 'Finish!'}</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </form>
        </div>
    );
};
export default StepWizard;