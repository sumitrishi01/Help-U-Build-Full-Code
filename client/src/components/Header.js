import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./helpubuil-web-logo.webp";
import "./header.css";
import { GetData } from "../utils/sessionStoreage";

const Header = () => {
  const [sessionData, setSessionData] = useState({
    isAuthenticated: false,
    user: null,
    role: '',
    isProfileComplete: false,
    dashboard: ''
  });

  const [scrollValue, setScrollValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollValue(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {

    const isAuthenticatedValue = GetData('islogin')
    const convertToBoolean = Boolean(isAuthenticatedValue);

    setSessionData(prevState => ({
      ...prevState,
      isAuthenticated: convertToBoolean
    }));

    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    
    // Check if UserData exists and has a role
    if (UserData && UserData.role === 'provider') {
      setSessionData(prevState => ({
        ...prevState,
        user: UserData,
        role: UserData.role,
        isProfileComplete: UserData.isProfileComplete || false,
      }));
    }
  }, []);
  // console.log(sessionData)
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  // console.log("i am sss", sessionData.isAuthenticated);

  return (
    <div>
      <section className={`as_header_wrapper ${scrollValue > 200 ? "fixed-header" : ""}`}>
        <div className="container-fluid">
          <div className="row py-2">
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6 forlogoresponsive">
              <div className="as_logo d-none d-md-block">
                <Link onClick={handleLinkClick} to={"/"}>
                  <img src={logo} className="img-responsive ws sm-screen-logo" alt="" />
                </Link>
              </div>
            </div>
            <div className="col-lg-9 col-md-9 col-sm-9 col-xs-6">
              <div className="as_right_info">
                <div className={`as_menu_wrapper ${isOpen ? "menu_open" : ""}`}>
                  <div className="showsmall">
                    <div className="as_logo">
                      <Link onClick={handleLinkClick} to={"/"}>
                        <img src={logo} className="img-responsive ws" alt="" />
                      </Link>
                    </div>
                    <div>
                      <span onClick={handleOpen} className="as_toggle">
                        <img src="assets/images/svg/menu.svg" alt="" />
                      </span>
                    </div>
                  </div>

                  <div className="as_menu">
                    <ul>
                      <li>
                        <Link onClick={handleLinkClick} to="/" className={active === "/" ? "active" : ""}>
                          home
                        </Link>
                      </li>
                      <li>
                        <Link onClick={handleLinkClick} to="/talk-to-architect" className={active === "/talk-to-architect" ? "active" : ""}>
                          Talk to Architect
                        </Link>
                      </li>
                      <li>
                        <Link onClick={handleLinkClick} to="/talk-to-interior" className={active === "/talk-to-interior" ? "active" : ""}>
                          Talk to Interior Designer
                        </Link>
                      </li>
                      <li>
                        <Link onClick={handleLinkClick} to="/Vastu" className={active === "/Vastu" ? "active" : ""}>
                          Talk to Vastu Experts
                        </Link>
                      </li>
                      <li>
                        <Link onClick={handleLinkClick} to="/blog" className={active === "/blog" ? "active" : ""}>
                          blog
                        </Link>
                      </li>

                      <li>
                        {sessionData.isAuthenticated ? (

                          <Link onClick={handleLinkClick}
                            className={`as_btn ${active === "/Profile" ? "active" : ""}`}
                            to={`${sessionData.role === 'provider' ? `/profile?role=${sessionData.role}` : 'profile?role=user'
                              }`}
                          >
                            Profile
                          </Link>
                        ) : (
                          <Link onClick={handleLinkClick}
                            className={`as_btn ${active === "/Login" ? "active" : ""}`}
                            to="/login"
                          >
                            Login
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;
