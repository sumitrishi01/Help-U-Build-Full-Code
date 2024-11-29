import React, { useEffect, useState } from 'react';
import howwework from './how-we-work.webp';
import toast from 'react-hot-toast';
import axios from 'axios';

const Extra = () => {
    const [image,setImage] = useState([])
    const fetchWorkImage = async () => {
        try {
            const {data} = await axios.get('http://localhost:5000/api/v1/get-all-describe-work-image')
            const allData = data.data;
            const filterData = allData.filter((item) => item.active === true)
            setImage(filterData)
        } catch (error) {
            console.log("Internal server error")
            toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
        }
    }

    useEffect(()=>{
        fetchWorkImage();
    },[])
    return (
        <div className="mx-5 extra-mobile">
            <div className='my-4'>
                <div className='row'>
                    <div className='col-lg-7 col-md-6'>                     
                            <h2 className='fs-2 main-heading text-capitalize fw-bolder mt-lg-5 mt-sm-1' data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine">How We Work Smoothly for Your Experience and Problems</h2>
                            {/* <h2 className='fs-1 fw-bolder'></h2> */}
                            <hr style={{ paddingTop: "2px" }} className='w-25  bg-warning' />
                   
                        <div className='row pt-3 ml-0'>
                            {[
                                {
                                    step: 1,
                                    text: "First, choose the category you'd like to chat about, such as Architecture, Interior Design, or Vastu. Select the one that suits your needs."
                                },
                                {
                                    step: 2,
                                    text: "Next, select a profile of architects, interior designers, or Vastu experts that matches your requirements and suits your needs."
                                },
                                {
                                    step: 3,
                                    text: "Feel free to start a chat and ask any questions you have. Our experts are here to help you with your doubts and provide the guidance you need!"
                                },
                                {
                                    step: 4,
                                    text: "Once you've finished chatting, you can ask more questions or discuss further. We're here to support anytime, every step by step."
                                }
                            ].map((item, index) => (
                                <div className="col-lg-6 mt-4" key={index}>
                                    <div className="position-relative step-bg" data-aos="fade-up" data-aos-easing="ease-in-back" data-aos-delay="300" data-aos-offset="0">
                                        <div className="position-absolute top-0 start-0 w-100 bg-light-dark bg-opacity-50"></div>
                                        <div className="pe-3 d-inline-flex align-items-center justify-content-start">
                                            <div className="d-inline-flex px-3 bg-white rounded-pill">
                                                <div className="d-flex align-items-center justify-content-center fs-5 fw-bold rounded-pill" style={{ width: "54px", height: "54px", background:'#0E294C' }}>
                                                    <span className='text-white'>{item.step}</span> {/* Dynamic step number */}
                                                </div>
                                            </div>
                                            <p className=" ms-3" style={{fontSize:'16px' }}>
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='col-lg-5 col-md-6'>
                        {
                            image && image.slice(0,1).map((item,index)=>(
                                <img key={index} className='img-fluid object-cover' src={item?.image?.url} alt="" data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000"/>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Extra