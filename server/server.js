const express = require('express')
const app = express()
const { createServer } = require('http')
const { Server } = require("socket.io");
require('dotenv').config()
const PORT = process.env.PORT || 9123;
const cors = require('cors')
const ConnectDB = require('./Config/DataBase');
const cookieParser = require('cookie-parser')
const axios = require('axios')

const { rateLimit } = require('express-rate-limit');
const router = require('./routes/routes');
const { singleUploadImage } = require('./middlewares/Multer');
const Chat = require('./models/chatAndPayment.Model');
const { chatStart, chatEnd, chatStartFromProvider } = require('./controllers/user.Controller');
const mongoose = require('mongoose')
// Middlewares
ConnectDB()

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many Request",
    statusCode: 429,
    handler: async (req, res, next) => {
        try {
            next()
        } catch (error) {
            res.status(options.statusCode).send(options.message)
        }
    }

})

app.set(express.static('public'))
app.use('/public', express.static('public'))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
})

app.locals.socketIo = io;

io.on('connection', (socket) => {
    console.log('A new client connected:', socket.id);

    const roomMembers = {};

    // Join a specific room
    socket.on('join_room', async ({ userId, astrologerId, role }, callback) => {
        try {
            const room = `${userId}_${astrologerId}`;

            if (role === 'user') {
                const result = await chatStart(userId, astrologerId);

                if (!result.success) {
                    socket.emit('error_message', { message: result.message });
                    return callback({ success: false, message: result.message });
                }

            }

            if (role === 'provider') {
                const result = await chatStartFromProvider(userId, astrologerId)
                if (!result.success) {
                    socket.emit('error_message', { message: result.message });
                    return callback({ success: false, message: result.message });
                }
            }

            // Join the room and store the role information
            socket.join(room);
            roomMembers[socket.id] = { userId, astrologerId, role, room };  // Store role here

            console.log(`${socket.id} joined room: ${room}`);
            console.log(`Current members in ${room}:`, [...socket.adapter.rooms.get(room)]);

            // Notify the client about successful room joining
            socket.emit('room_joined', { message: 'Welcome back. Start chat', room });
            // Respond with success to the callback
            callback({ success: true, message: 'Welcome back. Start chat' });
        } catch (error) {
            console.error('Error in join_room event:', error);
            socket.emit('error_message', { message: 'An error occurred while joining the room' });
        }
    });

    // Handle incoming messages
    socket.on('message', async ({ room, message, senderId, timestamp }) => {
        console.log(`Message from ${senderId} to ${room}:`, message);

        // Define prohibited patterns
        const prohibitedPatterns = [
            /\b\d{10}\b/,             // Detects 10-digit phone numbers
            /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Detects phone numbers like 123-456-7890, etc.
            /\b(?:\d{1,3}[.-]){1,3}\d{1,3}\b/, // Detects some IP address formats (e.g. 192.168.1.1)
            /@[\w.-]+\.[a-zA-Z]{2,6}/, // Detects email addresses (e.g. example@example.com)
            /\b18\+|adult\b/i,         // Detects terms like "18+" or "adult"
        ];

        // Check if the message matches any of the prohibited patterns
        const containsProhibitedContent = prohibitedPatterns.some(pattern => pattern.test(message));

        if (containsProhibitedContent) {
            // console.log("Prohibited content detected in the message.");
            socket.emit('wrong_message', { message: 'Your message contains prohibited content (phone number, email, or inappropriate terms).' });
            return; // Reject the message
        }

        try {
            // Save message to the database
            console.log("room id for update", room);
            await Chat.findOneAndUpdate(
                { room },
                { $push: { messages: { sender: senderId, text: message, timestamp: timestamp || new Date().toISOString() } } },
                { upsert: true, new: true }
            );

            // Send message to all participants in the room except the sender
            socket.to(room).emit('return_message', { text: message, sender: senderId, timestamp });
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    // Handle message deletion
    socket.on('delete_message_request', async ({ room, messageId, senderId }) => {
        try {
            // Delete the message from the database
            const chat = await Chat.findOne({ room });
            // console.log("object", messageId)
            const objectIdMessage = new mongoose.Types.ObjectId(messageId);
            // console.log("objectIdMessage",objectIdMessage)
            if (chat) {
                const updatedMessages = chat.messages.filter(msg => msg._id.toString() !== objectIdMessage.toString());
                const updatedChat = await Chat.findOneAndUpdate(
                    { room },
                    { $set: { messages: updatedMessages } },
                    { new: true }  // Returns the updated document
                );
                socket.emit('delete_message', { messageId });
                socket.to(room).emit('delete_message', { messageId });
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    });



    socket.on('file_upload', async ({ room, fileData, senderId, timestamp }) => {
        console.log(`File received in ${room}:`, fileData);
    
        try {
            // Basic validation on file
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(fileData.type)) {
                throw new Error('Invalid file type.');
            }
    
            if (Buffer.byteLength(fileData.content, 'base64') > 5 * 1024 * 1024) { // 5MB size check
                throw new Error('File size exceeds 5MB.');
            }
    
            // Save file to the database
            await Chat.findOneAndUpdate(
                { room },
                { $push: { messages: { sender: senderId, file: fileData, timestamp: timestamp || new Date().toISOString() } } },
                { upsert: true, new: true }
            );
    
            // Emit the file to all participants in the room except the sender
            socket.to(room).emit('return_message', { text: 'Attachment received', file: fileData, sender: senderId });
        } catch (error) {
            console.error('Error saving file to database:', error);
            socket.emit('file_upload_error', { error: error.message });
        }
    });
    

    // socket.on('delete_file', async ({ room, messageId }) => {
    //     try {
    //         // Validate the ObjectId
    //         if (!mongoose.Types.ObjectId.isValid(messageId)) {
    //             console.log("Invalid ObjectId:", messageId);
    //             return;
    //         }
    
    //         // Convert `messageId` to ObjectId
    //         const objectIdMessage = new mongoose.Types.ObjectId(messageId);
    
    //         // Find the chat and filter out the file message
    //         const chat = await Chat.findOne({ room });
    //         if (!chat) {
    //             console.log("Chat not found!");
    //             return;
    //         }
    
    //         const updatedMessages = chat.messages.filter(msg => msg._id.toString() !== objectIdMessage.toString());
    
    //         // Update the chat with the filtered messages
    //         const updatedChat = await Chat.findOneAndUpdate(
    //             { room },
    //             { $set: { messages: updatedMessages } },
    //             { new: true }
    //         );
    
    //         console.log("Updated Chat after File Deletion:", updatedChat);
    
    //         // Emit success to clients
    //         socket.to(room).emit('file_deleted', { messageId });
    
    //     } catch (error) {
    //         console.error("Error deleting file message:", error);
    //     }
    // });

    // Handle client disconnect
    // socket.on('disconnect', () => {
    //     console.log('A client disconnected:', socket.id);
    //     const room = roomMembers[socket.id];
    //     if (room) {
    //         console.log(`${socket.id} left room: ${room}`);
    //         delete roomMembers[socket.id];
    //     }
    // });

    

    socket.on('disconnect', async () => {
        console.log('A client disconnected:', socket.id);

        const roomData = roomMembers[socket.id];
        if (roomData) {
            const { userId, astrologerId, room, role } = roomData;
            console.log(`${socket.id} left room: ${room}`);
            delete roomMembers[socket.id];  // Remove the user from the room members list

            // Check who disconnected based on the role
            if (role === 'user') {
                console.log("User disconnected. Running wallet deduction logic...");

                // Run wallet deduction logic only if the user disconnects
                try {
                    const response = await chatEnd(userId, astrologerId);  // Assuming chatEnd takes userId and astrologerId
                    if (response.success) {
                        console.log('Chat ended successfully:', response.message);
                    } else {
                        console.error('Chat end error:', response.message);
                    }
                } catch (error) {
                    console.error('Error calling chatEnd:', error);
                }
            } else if (role === 'provider') {
                console.log("Astrologer (provider) disconnected. No wallet deduction logic.");
            } else {
                console.log("Unknown role for disconnector.");
            }
        } else {
            console.log("Room data not found for socket:", socket.id);
        }
    });

});

app.use(limiter)
app.post('/Fetch-Current-Location', async (req, res) => {
    const { lat, lng } = req.body;

    // Check if latitude and longitude are provided
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: "Latitude and longitude are required",
        });
    }

    try {
        // Check if the Google Maps API key is present
        if (!process.env.GOOGLE_MAP_KEY) {
            return res.status(403).json({
                success: false,
                message: "API Key is not found"
            });
        }

        // Fetch address details using the provided latitude and longitude
        const addressResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAP_KEY}`
        );

        // Check if any results are returned
        if (addressResponse.data.results.length > 0) {
            const addressComponents = addressResponse.data.results[0].address_components;
            // console.log(addressComponents)

            let city = null;
            let area = null;
            let postalCode = null;
            let district = null;

            // Extract necessary address components
            addressComponents.forEach(component => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                } else if (component.types.includes('sublocality_level_1')) {
                    area = component.long_name;
                } else if (component.types.includes('postal_code')) {
                    postalCode = component.long_name;
                } else if (component.types.includes('administrative_area_level_3')) {
                    district = component.long_name; // Get district
                }
            });

            // Prepare the address details object
            const addressDetails = {
                completeAddress: addressResponse.data.results[0].formatted_address,
                city: city,
                area: area,
                district: district,
                postalCode: postalCode,
                landmark: null, // Placeholder for landmark if needed
                lat: addressResponse.data.results[0].geometry.location.lat,
                lng: addressResponse.data.results[0].geometry.location.lng,
            };

            console.log("Address Details:", addressDetails);

            // Respond with the location and address details
            return res.status(200).json({
                success: true,
                data: {
                    location: { lat, lng },
                    address: addressDetails,
                },
                message: "Location fetch successful"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No address found for the given location",
            });
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch address",
        });
    }
});

app.use('/api/v1', router)

app.get('/', (req, res) => {
    res.send('Welcome To Help U Build')
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})