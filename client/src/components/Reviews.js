import React, { useState, useEffect } from "react";

import "./Reviews.css"; // Import the CSS for animation
import toast from "react-hot-toast";
import axios from "axios";

const Reviews = () => {
  // const reviews = [
  //   {
  //     image: "assets/images/c1.jpg",
  //     text: "“Help U Build transformed my design ideas into a stunning reality. Their attention to detail and commitment were outstanding!”",
  //     name: " Priya Sharma",
  //     title: "Architect",
  //   },
  //   {
  //     image: "assets/images/c2.jpg",
  //     text: "“Working with Help U Build was a fantastic experience. They delivered high-quality work on time, exceeding all my expectations”",
  //     name: "Rajesh Kumar",
  //     title: "Civil Engineer",
  //   },
  //   {
  //     image: "assets/images/c3.jpg",
  //     text: "“Help U Build's innovative approach and excellent craftsmanship made our project a success. I highly recommend their services!”",
  //     name: "Anjali Patel",
  //     title: "Interior Designer",
  //   },
  //   {
  //     image: "assets/images/c4.jpg",
  //     text: "“Help U Build's knowledge and precision in Vastu compliance were remarkable. They created a space that perfectly balances harmony and functionality”",
  //     name: "Sneha Gupta",
  //     title: " Vastu Consultant",
  //   },
  //   {
  //     image: "assets/images/c5.jpg",
  //     text: "“Help U Build offers top-notch service and expertise. They handled our project with professionalism and delivered excellent results.”",
  //     name: "Arun Singh",
  //     title: " Construction Manager",
  //   },
  //   {
  //     image: "assets/images/c6.jpg",
  //     text: "“I am thoroughly impressed with Help U Build's efficiency and quality. Their team brought our vision to life with great skill and dedication”",
  //     name: "Vikram Mehta",
  //     title: "Real Estate Developer",
  //   },
  // ];

  const [currentReview, setCurrentReview] = useState(0);
  const [fade, setFade] = useState(false);

  const [reviews,setReview] = useState([])

  const fetchReviews = async () => {
    try {
      const {data} = await axios.get('http://localhost:5000/api/v1/get-all-testimonial')
      setReview(data.data)
    } catch (error) {
      console.log("Internal server error in getting reviews");
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
    }
  }

  useEffect(()=>{
    fetchReviews()
  },[])

  const handleImageClick = (index) => {
    setFade(false); // Start fade out
    setTimeout(() => {
      setCurrentReview(index); // Change review after fade out
      setFade(true); // Start fade in
    }, 300); // Match this duration with CSS transition duration
  };

  useEffect(() => {
    setFade(true); // Trigger fade in when component mounts
  }, []);

  return (
    <div>
      <section className="as_customer_wrapper review-bg py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="as_heading as_heading_center"> What My Client Say </h2>
              <p className="text-center"> Our clients rave about our exceptional service, innovative designs, and the seamless experience we provide, ensuring their vision comes to life.
              </p>
              <div className="row">
                <div className="col-lg-5 col-md-5 d-flex gap-3 align-items-center">
                  {reviews && reviews.map((review, index) => (
                    <div
                      key={index}
                      className="as_customer_img mb-3"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={review?.image?.url}
                        alt={review.name}
                        className={`img-fluid img-thumbnail ${index === currentReview ? "border-primary" : ""
                          }`}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="col-lg-7 col-md-7 d-flex align-items-center">
                {reviews.length > 0 && (
                  <div className={`as_customer_box text-center fade ${fade ? "in" : "out" }`}>
                    <p className="as_margin0">{reviews[currentReview].testimonial}</p>
                    <h3>
                      {reviews[currentReview].name} -{" "}
                      <span>{reviews[currentReview].destination}</span>
                    </h3>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
