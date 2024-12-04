import React, { useState } from 'react';
import './Settings.css'; // Import custom CSS for styling
import ProfileUpdate from './ProfileUpdate';
// import Profile from './Tabs/Profile';
// import { Documnets } from './Tabs/Documnets';
// import Password from './Tabs/Password';
// import Enquiry from './Tabs/Enquiry';
// import ShareProfile from './Tabs/ShareProfile';

function Settings({ myProfile }) {
    const tabs = [
        { id: 1, title: 'Profile', content: 'Tab 1 content' },
        // { id: 2, title: 'Documents', content: 'Tab 2 content' },
        // { id: 3, title: 'Change Password', content: 'Tab 3 content' },
        // { id: 4, title: 'Share Profile', content: 'Share your profile with others' },
        // { id: 5, title: 'Enquiry', content: 'Tab 3 content' }
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const handleTabClick = (id) => {
        setActiveTab(id);
    };

    return (
        <>
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
                {activeTab === 1 && <ProfileUpdate />}
                {/* {activeTab === 2 && <></>}
                {activeTab === 3 && <></>}
                {activeTab === 4 && <></>}
                {activeTab === 5 && <></>} */}
            </div>
        </>
    )
}

export default Settings
