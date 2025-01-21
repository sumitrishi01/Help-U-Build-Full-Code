import React, { useState } from 'react';
import './Settings.css'; // Import custom CSS for styling
import Profile from './Tabs/Profile';
import { Documnets } from './Tabs/Documnets';
import Password from './Tabs/Password';
import Enquiry from './Tabs/Enquiry';
import ShareProfile from './Tabs/ShareProfile'; // New ShareProfile component
import StatusPage from './Tabs/StatusPage';
import BankDetail from './Tabs/BankDetail';
import UpdateServices from './Tabs/UpdateServices';
import { GetData } from '../../utils/sessionStoreage';

const Settings = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const type = UserData?.type;
  // Define tabs as an array of objects
let tabs;
  if(type === 'Vastu'){
    tabs = [
      { id: 1, title: 'Profile', content: 'Tab 1 content' },
      { id: 2, title: 'Documents', content: 'Tab 2 content' },
      { id: 3, title: 'Bank Detail', content: 'Tab 4 content' },
      { id: 4, title: 'Change Password', content: 'Tab 3 content' },
      { id: 5, title: 'Enquiry', content: 'Share your profile with others' },
      { id: 6, title: 'Availability Status', content: 'Share your profile with others' },
    ];
  }else{
    tabs = [
      { id: 1, title: 'Profile', content: 'Tab 1 content' },
      { id: 6, title: 'Update Service', content: 'Tab 5 content' },
      { id: 2, title: 'Documents', content: 'Tab 2 content' },
      { id: 3, title: 'Bank Detail', content: 'Tab 4 content' },
      { id: 4, title: 'Change Password', content: 'Tab 3 content' },
      { id: 5, title: 'Availability Status', content: 'Share your profile with others' },
    ];
  }


  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Function to handle tab click
  const handleTabClick = (id) => {
    setActiveTab(id);
  };

  return (
    <>
      {/* Tab Navigation */}
      <ul className="nav w-100 mt-4 nav-pills mb-4 justify-content-between" id="ex1" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.id}>
            <a
              className={`nav-link border-outline-dark as_btn ${activeTab === tab.id ? 'active' : ''}`}
              href="#!"
              onClick={() => handleTabClick(tab.id)}
              role="tab"
              aria-controls={`ex3-tabs-${tab.id}`}
              aria-selected={activeTab === tab.id}
            >
              {tab.title}
            </a>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 1 && <Profile />}
        {activeTab === 2 && <Documnets />}
        {activeTab === 3 && <BankDetail />}
        {activeTab === 4 && <Password />}
        {activeTab === 5 && <StatusPage />}
        {activeTab === 6 && <UpdateServices />}
      </div>
    </>
  );
};

export default Settings;
