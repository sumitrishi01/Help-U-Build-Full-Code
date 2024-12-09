import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import './chat.css';
import { MdAttachment } from "react-icons/md";
import ScrollToBottom from 'react-scroll-to-bottom';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import AccessDenied from '../../components/AccessDenied/AccessDenied';
// import Login from '../auth/Login'

const ENDPOINT = 'https://api.helpubuild.co.in/';

const ChatDemo = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socketId, setSocketId] = useState('');
    const [file, setFile] = useState(null);
    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    const [astroId, setAstroId] = useState('')
    const [IsChatBoxActive, setIsChatBoxActive] = useState(false)

    // console.log("message",UserData._id)
    const id = UserData?._id || ''

    const socket = useMemo(() => io(ENDPOINT, { autoConnect: false }), []);

    const handleChatStart = async (chatId) => {
        console.log("chatId", chatId);
        try {
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-chat-by-id/${chatId}`);
            setIsChatBoxActive(true);
            setMessage([]);
            const allData = data.data;
            const userId = allData?.userId?._id;
            const providerId = allData?.providerId?._id;
            const allMessageData = allData.messages;
            setMessages(allMessageData);
    
            if (UserData?.role === 'provider') {
                setAstroId(userId);
            } else {
                setAstroId(providerId);
            }
    
            // Join the room
            const room = `${userId}_${providerId}`;
            socket.emit('join_room', { userId, astrologerId: providerId, role: UserData.role });
            console.log(`Joined room: ${room}`);
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };
    

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log('Connected!', socket.id);
            setSocketId(socket.id);
        });

        // Listen for messages and update the state
        socket.on('return_message', (data) => {
            console.log('Received message:', data);
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('connect');
            socket.off('return_message');
            socket.disconnect();
        };
    }, [socket]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
            console.log('Selected File:', file);
        }
    };

    // Handle message submission
    const handleSubmit = (e) => {
        e.preventDefault();
        let room = ''
        if (UserData.role === 'provider') {
            room = `${astroId}_${UserData._id}`;
        } else {
            room = `${UserData._id}_${astroId}`
        }

        console.log("userid", UserData._id, astroId)
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = { name: file.name, type: file.type, content: reader.result };
                socket.emit('file_upload', { room, fileData, sender: UserData._id, timestamp: new Date().toISOString() });

                setMessages((prev) => [
                    ...prev,
                    {
                        text: file.name, file: fileData, sender: UserData._id, timestamp: new Date().toISOString()
                    },
                ]);
                setFile(null);
            };
            reader.readAsDataURL(file);
        } else if (message.trim()) {
            const payload = { room, message, senderId: UserData._id, timestamp: new Date().toISOString() };
            socket.emit('message', payload);

            setMessages((prev) => [...prev, { text: message, sender: UserData._id, timestamp: new Date().toISOString() }]);
            setMessage('');
        }
    };

    const [allProviderChat, setProviderChat] = useState([])

    const fetchChatProverId = async () => {

        if (!UserData) {
            return toast.error('Please Login First')
        } else if (UserData?.role === 'provider') {
            const providerId = UserData._id;
            try {
                const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-chat-by-providerId/${providerId}`)
                const allData = data.data
                // const allMessage = allData;
                // setMessages(allMessage)
                // console.log("all data",allMessage)
                const filterReverse = allData.reverse();
                setProviderChat(filterReverse)
            } catch (error) {
                console.log("Internal server error", error)
            }
        } else {
            const userId = UserData._id;
            try {
                const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-chat-by-userId/${userId}`)
                const allData = data.data
                const filterReverse = allData.reverse();
                setProviderChat(filterReverse)
            } catch (error) {
                console.log("Internal server error", error)
            }
        }
    }

    useEffect(() => {
        fetchChatProverId();
    }, [])
    if (!UserData) {
        // return window.location.href = '/login'
        return <AccessDenied />
    }
    return (
        <section style={{ backgroundColor: '#CDC4F9' }}>
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card" style={{ borderRadius: '15px' }}>
                            <div className="card-body">
                                <div className="row">
                                    {/* Sidebar with Chat List */}
                                    <div className="col-md-4 mb-4">
                                        <div className="p-3">
                                            {UserData?.role === 'provider' ?
                                                <div className='heading-chat-list w-100 mb-2'><h3 className=' p-1 m-0'>Customer</h3></div> :
                                                <div className='heading-chat-list w-100 mb-2'><h3 className=' p-1 m-0'>Provider</h3></div>}
                                            <div className="input-group rounded mb-3">
                                                <input
                                                    type="search"
                                                    className="form-control rounded"
                                                    placeholder="Search"
                                                    aria-label="Search"
                                                />
                                                <span className="input-group-text border-0">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                            <ul className="list-unstyled connection-list mb-0">

                                                {/* <li className="p-2 border-bottom"></li> */}
                                                {
                                                    allProviderChat && allProviderChat.map((chat, index) => (
                                                        <li onClick={() => handleChatStart(chat._id)} key={index} className="p-2 border-bottom">
                                                            <div className="d-flex flex-row">
                                                                {UserData?.role === 'provider' ? (
                                                                    <div style={{display:'flex'}} className=" flex-row cursor-ppointer w-100 justify-content-between">
                                                                        <div className='profile_img_box'>
                                                                            <img
                                                                                src={chat?.userId?.ProfileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.userId?.name || 'User')}&background=random`}
                                                                                alt={chat?.userId?.name}
                                                                                style={{display:'flex'}}
                                                                                className="align-self-center"
                                                                            />
                                                                            {/* <span className="badge bg-success badge-dot"></span> */}
                                                                        </div>
                                                                        <div className="pt-1 chat_list">
                                                                            <p className="fw-bold mb-0">{chat?.userId?.name}</p>
                                                                            {/* <p className="small text-muted">Hello, Are you there?</p> */}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{display:'flex'}} className="flex-row cursor-ppointer w-100 justify-content-between">
                                                                        <div className='profile_img_box'>
                                                                            <img
                                                                                src={chat?.providerId?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.providerId?.name || 'User')}&background=random`}
                                                                                alt={chat?.providerId?.name}
                                                                                className="align-self-center"
                                                                                style={{display:'flex'}}
                                                                            />
                                                                            {/* <span className="badge bg-success badge-dot"></span> */}
                                                                        </div>
                                                                        <div className="pt-1 chat_list">
                                                                            <p className="fw-bold mb-0">{chat?.providerId?.name}</p>
                                                                            {/* <p className="small text-muted">Hello, Are you there?</p> */}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Chat Window */}
                                    {
                                        IsChatBoxActive ? (<>
                                            <div className="col-md-8 chat-box">
                                                <div className="chat-head">
                                                    <h2>Chats...</h2>
                                                </div>
                                                <ScrollToBottom initialScrollBehavior='smooth' className="chat-window">

                                                    {messages.map((msg, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`d-flex flex-row ${msg.sender === id ? 'justify-content-end' : 'justify-content-start'
                                                                }`}
                                                        >
                                                            {msg.file ? (
                                                                <p className="small p-2 mb-1 rounded-3 bg-body-tertiary">
                                                                    <a href={msg.file.content} download={msg.file.name}>
                                                                        {/* {msg.file.name} */}
                                                                        <img src={msg.file.content} style={{ width: '160px', border: '3px solid rgb(204, 204, 204),', height: '150px', borderRadius: '10px' }} alt={msg.file.name} />
                                                                    </a>
                                                                </p>
                                                            ) : (
                                                                <p
                                                                    className={`small p-2 mb-1 forMessageStyling rounded-3 ${msg.sender === id ? 'self-message' : 'bg-light'
                                                                        }`}
                                                                >
                                                                    {msg.text}
                                                                    <div className='forTimeRelated'>
                                                                        <span className="messageTimeAbsolute"> {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        }) || 'Not-Available'}</span>
                                                                    </div>
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </ScrollToBottom>
                                                <form className="d-flex align-items-center" onSubmit={handleSubmit}>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Type message"
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                    />
                                                    <input
                                                        type="file"
                                                        id="fileUpload"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="fileUpload" className="ms-2">
                                                        <MdAttachment size={24} />
                                                    </label>
                                                    <button type="submit" className="btn btn-primary ms-2">
                                                        Send
                                                    </button>
                                                </form>
                                            </div>
                                        </>) : (
                                            <>
                                                <div className='col-md-8 chat-box'>
                                                    <div className='empty-box'>
                                                        <div className="message-text">
                                                            <h5>Your messages</h5>
                                                            <p>Send a message to start the conversation</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatDemo;