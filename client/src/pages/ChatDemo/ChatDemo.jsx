import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import './chat.css';
import { MdAttachment } from "react-icons/md";
import ScrollToBottom from 'react-scroll-to-bottom';

const ENDPOINT = 'https://api.helpubuild.co.in/';

const ChatDemo = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Stores chat messages
    const [socketId, setSocketId] = useState('');
    const [file, setFile] = useState(null); // State for file attachments

    const token = 'djf9233hcdmw2108djo291jdkdow29hf'; // Example token
    const user = {
        _id: "fjoeij09rj290jef",
        name: 'Hitesh Yadav',
    };
    const astrologerId = 'kfj209jfidj903jsw0';

    const socket = useMemo(() => io(ENDPOINT, { autoConnect: false }), []);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log('Connected!', socket.id);
            setSocketId(socket.id);

            const room = `${user._id}_${astrologerId}`;
            socket.emit('join_room', { userId: user._id, astrologerId });
        });

        socket.on('return_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('connect');
            socket.off('return_message');
            socket.disconnect();
        };
    }, [socket, astrologerId]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
            console.log('Selected File:', file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const room = `${user._id}_${astrologerId}`;
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = { name: file.name, type: file.type, content: reader.result };
                socket.emit('file_upload', { room, fileData, senderId: socketId });

                setMessages((prev) => [
                    ...prev,
                    { text: file.name, file: fileData, sender: 'self' },
                ]);
                setFile(null);
            };
            reader.readAsDataURL(file);
        } else if (message.trim()) {
            const payload = { room, message, senderId: socketId };
            socket.emit('message', payload);

            setMessages((prev) => [
                ...prev,
                { text: message, sender: 'self' },
            ]);
            setMessage('');
        }
    };

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
                                            <ul className="list-unstyled mb-0" style={{ height: '400px', overflowY: 'auto' }}>
                                                <li className="p-2 border-bottom">
                                                    <div className="d-flex flex-row">
                                                        <div>
                                                            <img
                                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                                                alt="avatar"
                                                                className="d-flex align-self-center me-3"
                                                                width="60"
                                                            />
                                                            <span className="badge bg-success badge-dot"></span>
                                                        </div>
                                                        <div className="pt-1">
                                                            <p className="fw-bold mb-0">Marie Horwitz</p>
                                                            <p className="small text-muted">Hello, Are you there?</p>
                                                        </div>
                                                    </div>
                                                </li>
                                                {/* Add more chat users here */}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Chat Window */}
                                    <div className="col-md-8 chat-box">
                                        <div className="chat-head">
                                            <h2>Chats...</h2>
                                        </div>
                                        <ScrollToBottom className="chat-window">
                                            {messages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`d-flex flex-row ${msg.sender === 'self' ? 'justify-content-end' : 'justify-content-start'
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
                                                            className={`small p-2 mb-1 rounded-3 ${msg.sender === 'self' ? 'self-message' : 'bg-light'
                                                                }`}
                                                        >
                                                            {msg.text}
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
