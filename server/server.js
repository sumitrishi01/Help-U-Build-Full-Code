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

const activeTimers = {};
const roomMembers = {};
let providerconnect;

io.on('connection', (socket) => {
    console.log('A new client connected:', socket.id);


    // Join a specific room
    socket.on('join_room', async ({ userId, astrologerId, role }, callback) => {
        try {
            const room = `${userId}_${astrologerId}`;

            if (role === 'provider') {
                const result = await chatStartFromProvider(userId, astrologerId);
                socket.to(room).emit('provider_connected', { room });
                // console.log("iam hit")
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

    // Handle the first message from the user
   
    
    
    

    socket.on('provider_connected', ({ room }) => {
        console.log('Provider connected to room:', room);

        // Clear the 1-minute timer if it's active
        if (activeTimers[room]) {
            console.log(`Clearing timer for room: ${room}`);
            clearTimeout(activeTimers[room]);
            delete activeTimers[room];
        }

        // Mark the provider as connected in the roomMembers object for the user
        const connectedSockets = [...socket.adapter.rooms.get(room) || []];
        connectedSockets.forEach((socketId) => {
            if (roomMembers[socketId]?.role === 'user') {
                console.log("i am hit")
                roomMembers[socketId].providerConnected = true;
            }
        });
        console.log(`Provider connected to room: ${room}. Timer cleared.`);
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

    socket.on('disconnect', async () => {
        console.log('A client disconnected:', socket.id);

        const roomData = roomMembers[socket.id];
        if (roomData) {
            const { userId, astrologerId, room, role } = roomData;

            // Clear any active timer for the room
            if (activeTimers[room]) {
                clearTimeout(activeTimers[room]);
                delete activeTimers[room];
            }

            delete roomMembers[socket.id];
            console.log(`${socket.id} left room: ${room}`);

            // Check remaining connections in the room
            const connectedSockets = [...socket.adapter.rooms.get(room) || []];
            const userSocket = connectedSockets.find((s) => roomMembers[s]?.role === 'user');
            const providerSocket = connectedSockets.find((s) => roomMembers[s]?.role === 'provider');

            // if(providerSocket){
            // }

            console.log("role", role)

            if (role === 'provider') {
                providerconnect = true;
                console.log("providerconnect", providerconnect)
                console.log('Provider disconnected. Waiting for user to disconnect to end the chat.');
                // Notify the user that the provider disconnected
                if (userSocket) {
                    io.to(userSocket).emit('provider_disconnected', { message: 'The provider has left the chat.' });
                }

            } else if (role === 'user') {
                console.log('User disconnected. Checking provider status...');
                if (providerconnect) {
                    // console.log("i am in providerconnect")
                    roomData.providerConnected = true;
                }
                // If the provider was connected at some point, end the chat
                if (roomData.providerConnected) {
                    console.log('Both user and provider connected at some point. Running chatEnd...');
                    try {
                        const response = await chatEnd(userId, astrologerId);
                        if (response.success) {
                            providerconnect = false;
                            console.log('Chat ended successfully:', response.message);
                        } else {
                            console.error('Chat end error:', response.message);
                        }
                    } catch (error) {
                        console.error('Error calling chatEnd:', error);
                    }
                } else {
                    console.log("User disconnected before provider connected. No wallet deduction performed.");
                }
            }

            // Update `bothConnected` flag if both parties are still in the room
            if (userSocket && providerSocket) {
                roomMembers[userSocket].providerConnected = true;
                roomMembers[providerSocket].providerConnected = true;
            }
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