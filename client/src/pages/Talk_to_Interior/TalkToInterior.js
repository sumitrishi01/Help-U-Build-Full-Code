import React, { useEffect, useState } from 'react'
import StarRating from '../../components/StarRating/StarRating'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { GetData } from '../../utils/sessionStoreage'
import { Modal, Button, Form } from 'react-bootstrap';

const TalkToInterior = () => {
    const [allProvider, setAllProvider] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const Data = GetData('user')
    const token = GetData('token')
    const UserData = JSON.parse(Data)
    const [walletAmount, setWalletAmount] = useState(0);
    const [formData, setFormData] = useState({
      userId: '',
      providerId: "",
  })
  
    const handleFetchUser = async () => {
      try {
        const UserId = UserData?._id;
        const { data } = await axios.get(`http://localhost:5000/api/v1/get-single-user/${UserId}`);
  
        const formattedAmount = data.data.walletAmount.toFixed(2);
  
        setWalletAmount(formattedAmount);
      } catch (error) {
        console.log("Internal server error in fetching User")
        toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
      }
    }
  
    const handleFetchProvider = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/get-all-provider')
        const allData = data.data;
        const filterData = allData.filter((item) => item.type === 'Interior')
        setAllProvider(filterData)
      } catch (error) {
        console.log("Internal server error in fetching providers")
        toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
      }
    }
    useEffect(() => {
      if (UserData?.role === 'user') {
        handleFetchUser();
      }
      handleFetchProvider();
    }, [])
  
    const handleOpenModel = async () => {
      if (!token) {
        return toast.error('Login First!');
      } else if (UserData?.role === 'provider') {
        return toast.error(`You are a provider. You don't have access.`);
      }
      setShowModal(true);
    };
  
    // Dynamically load the Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
  
    const handleCloseModel = () => {
      setShowModal(false);
      setAmount(''); // Reset the amount when closing the modal
    };
  
    const handlePresetAmount = (preset) => {
      setAmount(preset);
    };
  
    const handleActiveTime = async (Chat, providerId) => {
      if (!UserData) {
        return toast.error('Login first');
      } else if (UserData.role === 'provider') {
        return toast.error("Access Denied: Providers are not authorized to access this feature.");
      } else if (Chat === 'Chat') {
        const newForm = {
          ...formData,
          userId: UserData._id,
          providerId: providerId, // Include providerId
        };
        try {
          const res = await axios.post('http://localhost:5000/api/v1/create-chat', newForm);
          window.location.href = '/chat';
        } catch (error) {
          console.log("Internal server error", error);
          toast.error(
            error?.response?.data?.errors?.[0] ||
            error?.response?.data?.message ||
            "Please try again later"
          );
        }
      }
    };
    
  
    const handleMakePayment = async () => {
      if (!amount || amount <= 0) {
        return toast.error('Please enter a valid amount');
      }
      // toast.success(`Proceeding with payment of ₹${amount}`);
      // handleCloseModel();
  
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Failed to load Razorpay SDK. Please check your connection.');
          return;
        }
  
        const UserId = UserData?._id;
  
        const res = await axios.post(`http://localhost:5000/api/v1/create-payment/${UserId}`, {
          price: amount
        })
        console.log("Order", res.data.data)
        const order = res.data.data.razorpayOrder;
  
        if (order) {
  
          const options = {
            key: 'rzp_test_cz0vBQnDwFMthJ',
            amount: amount * 100,
            currency: 'INR',
            name: 'Help U Build',
            description: 'Doing Recharge',
            order_id: order?.id || '',
            callback_url: "http://localhost:5000/api/v1/verify-payment",
            prefill: {
              name: UserData?.name,
              email: UserData?.email,
              contact: UserData?.PhoneNumber
            },
            theme: {
              color: '#F37254'
            },
          };
  
          const rzp = new window.Razorpay(options);
  
          rzp.open();
        }
  
  
      } catch (error) {
        console.log("Internal server error", error)
        toast.error(error?.response?.data?.message || 'Failed to Reacharge. Please try again.');
      }
    };
  
    return (
        <>
      <div className='main-bg'>
        <div className='section architecture-section-one'>
          <div className='container-fluid architecture-section-p'>
            <div className='row'>
              <div className='col-lg-12'>
                <div className='top-filter-area'>
                  <form>
                    <div className='top-bar'>
                      <div className='architectur-bar'>
                        <h3 className='architecture-heading'>Talk To Interior Designer</h3>
                      </div>
                      <div className='architectur-bar'>
                        <div className="available-balance medium-device-balance"> Available balance: <main class="balance-avail"> ₹ {walletAmount} </main></div>
                      </div>
                      <div className='architectur-bar'>
                        <div className='recharge-btn'>
                          <a onClick={handleOpenModel} className="medium-device-recharge">Recharge</a>
                          <button className="filter_short-btn"><i class="fa fa-filter"></i> Filter </button>
                          <button type="button" class="btn filter-short-by" data-bs-toggle="modal" data-bs-target="#staticBackdrop"><i className="fa fa-sort-amount-desc"></i> Sort by</button>
                          {/* filter-short-by modal popup */}
                          <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5 className="modal-title" id="staticBackdropLabel">Sort by</h5>
                                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                  <div class="short_by_object">
                                    <input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_0" value="" />
                                    <label class="lable_radio selected popularty-lable" for="short_0"> Popularity </label>
                                  </div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_2" value="sortByExperience_0" /><label class="lable_radio" for="short_2"> Experience  : Low to High </label></div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_3" value="sortByOrder_1" /><label class="lable_radio" for="short_3"> Total orders : High to Low </label></div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_4" value="sortByOrder_0" /><label class="lable_radio" for="short_4"> Total orders : Low to High </label></div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_5" value="sortByPrice_1" /><label class="lable_radio" for="short_5"> Price : High to Low </label></div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_6" value="sortByPrice_0" /><label class="lable_radio" for="short_6"> Price : Low to High </label></div>
                                  <div class="short_by_object"><input type="radio" name="shorting" autocomplete="off" class="form-check-input" id="short_7" value="sortByRating_1" /><label class="lable_radio" for="short_7"> Rating : High to Low </label></div>
                                </div>

                              </div>
                            </div>
                          </div>
                          {/* enf of filter sort by*/}
                          <div className="form-search classsearhMbile">
                            <input name="searchText" type="search" autocomplete="off" id="searchAstroQuery" class="form-control customform-control postion_Rel ng-pristine ng-valid ng-touched" placeholder="Search..." /><i class="fa fa-search"></i></div>
                        </div>
                      </div>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='section architecture-section-2 mb-5'>
          <div className="container-fluid architecture-section-p">
            <div className='row'>
              {allProvider && allProvider.map((item, index) => (
                <div className='col-12 col-md-6 col-lg-6 col-xl-4' key={index}>
                  <div className="card-custom align-items-center justify-content-between my-2">
                    <div className="card-detail align-items-center">
                      <div style={{ display: 'flex' }}>
                        <Link to={`/architect-profile/${item._id}`} className='profile-image text-center'>
                          <img
                            src={item?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random`}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                            alt="Profile"
                            className="profile-img me-4"
                          />
                          <StarRating rating={item.averageRating || 0} />
                          {/* <p className="text-small text-muted mb-1 me-4">{item.Orders}</p> */}
                        </Link>
                        <div className='profile-content'>
                          <h5 className="mb-1"><Link to={`/architect-profile/${item._id}`}>{item.name}</Link></h5>
                          <p className="text-small text-muted mb-1">{item.type}</p>
                          <p className="text-small text-muted mb-1"> {item.language && item.language.map((lang, index) => {
                            return (
                              <span key={index} className="archi-language-tag">
                                {lang}{index < item.language.length - 1 ? ', ' : ''}
                              </span>
                            );
                          }) || ''}</p>
                          <p className="text-small text-muted mb-1">
                            {item.expertiseSpecialization && item.expertiseSpecialization.map((lang, index) => {
                              return (
                                <span key={index} className="archi-language-tag">
                                  {lang}{index < item.expertiseSpecialization.length - 1 ? ', ' : ''}
                                </span>
                              );
                            }) || ''}
                          </p>
                          <p className="text-small text-muted mb-1">
                            <span className='archi-language-tag'>{`₹ ${item.pricePerMin}/min`}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-end contact-btn">
                        <div className='col-xl-12 col-lg-12 col-md-12 col-12'>
                          <div className='connect-area'>
                            {/* <button style={{ fontSize: '15px', padding: '3px', width: '52%' }} className="btn profile-call-btn"><i class="fa-solid fa-phone-volume"></i> Call</button>
                            <button style={{ fontSize: '15px', padding: '3px', width: '52%' }} className="btn profile-chat-btn mt-2"><i class="fa-regular fa-comments"></i> Chat</button>
                            <button style={{ fontSize: '15px', padding: '3px', width: '52%' }} className="btn profile-video-btn mt-2"><i class="fa-solid fa-video"></i> Video</button> */}
                            <button style={{ fontSize: '15px', padding: '3px', width: '52%' }} disabled={!item.callStatus} className={`btn ${item.callStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`}><i class="fa-solid fa-phone-volume"></i> Call</button>
                            <button onClick={() => handleActiveTime("Chat", item._id)}  style={{ fontSize: '15px', padding: '3px', width: '52%' }} disabled={!item.chatStatus} className={`btn mt-2 ${item.chatStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`}><i class="fa-regular fa-comments"></i> Chat</button>
                            <button style={{ fontSize: '15px', padding: '3px', width: '52%' }} disabled={!item.meetStatus} className={`btn mt-2 ${item.meetStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`}><i class="fa-solid fa-video"></i> Video</button>
                          </div>
                        </div>
                        {/* <div class="dropdown connect-btn">
                          <a class="btn dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Connect
                          </a>
                          <ul class="dropdown-menu connect-dropdown">
                            <li><a class="dropdown-item" href="#">Call</a></li>
                            <li><a class="dropdown-item" href="#">Chat</a></li>
                            <li><a class="dropdown-item" href="#">Video</a></li>
                          </ul>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      <Modal show={showModal} onHide={handleCloseModel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recharge Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter Recharge Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={amount}
                style={{ border: '1px solid #CFD4DA' }}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-around my-3">
              {[100, 300, 500].map((preset) => (
                <Button
                  key={preset}
                  variant="outline-primary"
                  onClick={() => handlePresetAmount(preset)}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModel}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#E9BB37', border: '1px solid #E9BB37' }} variant="primary" onClick={handleMakePayment}>
            Confirm Recharge
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    )
}

export default TalkToInterior;