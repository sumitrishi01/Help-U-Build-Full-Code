import React from "react";
import logo from "./Help_You_Build__1_-removebg-preview (1).png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <section style={{ background: "#042F66" }} class="as_padderTop80">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="as_footer_inner ">
                <div class="row">
                  <div class="col-lg-3 col-md-6 col-sm-12">
                    <div class="as_footer_widget">
                      <div class="as_footer_logo">
                        <img src={logo} className="w-50" alt="" />
                      </div>
                      <p style={{ color: "white" }}>
                     
                      </p>

                      <ul style={{ color: "white" }} class="as_contact_list">
                        <li>
                          <img src="assets/images/svg/map.svg" alt="" />
                          <p style={{ color: "white" }}>
                            368, Harbala ki Dhani, Village Sikohpur, Sector 78,
                            Gurugram-122004
                          </p>
                        </li>
                        <li>
                          <img src="assets/images/svg/phone.svg" alt="" />
                          <p>
                            <a href="javascript:;">+91 8826465693</a>
                          </p>
                        </li>
                        <li>
                          <img src="assets/images/svg/mail.svg" alt="" />
                          <p>
                            <a href="javascript:;">
                              info@helpubuild.co.in
                            </a>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6 col-sm-12">
                    <div style={{ color: "white" }} class="as_footer_widget">
                      <h3 class="as_footer_heading">Quick Links</h3>

                      <ul>
                        <li>
                          <Link to="/member-registration"> Become A Partner</Link>
                        </li>
                        <li>
                          <Link to="/about"> About Us</Link>
                        </li>
                        <li>
                          <Link to="/blog"> Blog</Link>
                        </li>
                        {/* <li>
                          <Link to="/"> Astrologers</Link>
                        </li> */}
                        {/* <li><a to="appointment.html"> Appointment</Link></li> */}
                        <li>
                          <Link to="Contact"> Contact Us</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6 col-sm-12">
                    <div style={{ color: "white" }} class="as_footer_widget">
                      <h3 class="as_footer_heading">Our Services</h3>

                      <ul>
                        <li>
                          <a href="/talk-to-architect">Talk to Architect</a>
                        </li>
                        <li>
                          <a href="/talk-to-interior">Talk to Interior Designer</a>
                        </li>
                        <li>
                          <a
                            href="/Vastu">Talk to Vastu Experts</a>
                        </li>
                        {/* <li>
                          <a href="/Construction-mall">Shop</a>
                        </li>
                        <li>
                          <a href="/Privacy-Policy">
                            Privacy-Policy
                          </a>
                        </li> */}
                      </ul>
                    </div>
                  </div>

                  <div class="col-lg-3 col-md-6 col-sm-12">
                    <div style={{ color: "white" }} class="as_footer_widget">
                      <h3 class="as_footer_heading">Our Newsletter</h3>

                      <p>
                        Subscribe for insights on architecture, interior design,
                        Vastu tips, and exclusive offers directly to your inbox.
                      </p>

                      <div class="as_newsletter_wrapper">
                        <div class="as_newsletter_box">
                          <input
                            type="text"
                            name=""
                            id=""
                            class="form-control"
                            placeholder="Email..."
                          />
                          <a href="javascript:;" class="as_btn">
                            <img src="assets/images/svg/plane.svg" alt="" />
                          </a>
                        </div>
                      </div>

                      {/* <div class="as_login_data">
                        <label>
                          I agree that my submitted data is being collected and
                          stored.
                          <input
                            type="checkbox"
                            name="as_remember_me"
                            value=""
                          />
                          <span class="checkmark"></span>
                        </label>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>

              <div class="as_copyright_wrapper text-center">
                <p className="text-white">
                  Copyright &copy; {new Date().getFullYear()} Help U Build.
                  All Right Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;
