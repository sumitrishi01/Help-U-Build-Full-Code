import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Blog from "./components/Blog";
import Architecture from "./pages/Services/Architecture";
import Interior from "./pages/Services/Interior";
import Vastu from "./pages/Services/Vastu";
import ConstructionMall from "./pages/Services/ConstructionMall";
import BlogSingle from "./pages/BlogSingle/BlogSingle";
import Basic_details from "./pages/Basic_details/Basic_details";
import Profiles from "./pages/Profiles/Profiles";
import Register from "./pages/auth/Register";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import TalkToInterior from "./pages/Talk_to_Interior/TalkToInterior";
import MembershipRegistration from "./Provider/MembershipRegistration";
import MemberProfile from "./pages/Profiles/MemberProfile";
import UserDashboard from "./pages/User_Dashboard/UserDashboard";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Chat from "./pages/Chat/Chat";
import ChatDemo from "./pages/ChatDemo/ChatDemo";
import TalkToArchitect from "./pages/Services/TalkToArchitecture";
import ArchitectProfile from "./pages/Services/ArchitectProfile";
import StepWizard from "./components/StepWizard";
import Blog_Page from "./pages/Blog_Page/Blog_Page";
// Scroll to top component
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]); 
  return null;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true, // Whether animation should happen only once
    });
  }, []);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog_Page />} />
        <Route path="/Architecture" element={<Architecture />} />
        <Route path="/talk-to-architect" element={<TalkToArchitect />} />
        <Route path="/architect-profile/:id" element={<ArchitectProfile />} />
        <Route path="/Interior" element={<Interior />} />
        <Route path="/Vastu" element={<Vastu />} />
        <Route path="/Construction-mall" element={<ConstructionMall />} />
        <Route path="/blog-details/:id" element={<BlogSingle />} />
        <Route path="/Basic-details" element={<Basic_details />} />
        <Route path="/profile-details" element={<Profiles />} />
        {/* user authontication rout */}
        <Route path="/user-register" element={<Register />} />
        <Route path="/profile" element={<UserDashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/otp-verification/user" element={<VerifyEmail />} />
        <Route path="/talk-to-interior" element={<TalkToInterior />} />
        {/* <Route path="/member-registration" element={<MembershipRegistration />} /> */}
        <Route path="/member-registration" element={<StepWizard />} />
        <Route path="/profile-page/:id" element={<MemberProfile />} />


        <Route path="/chat" element={<Chat />} />
        <Route path="/chat-demo" element={<ChatDemo />} />

        {/* <Route path="/demo-register" element={<StepWizard />} /> */}
      </Routes>
      <Toaster />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
