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
const Chat = require('./models/Chat.model');
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
        // allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    },
})

app.locals.socketIo = io ;

io.on('connection', (socket) => {
    console.log('A new client connected:', socket.id);

    socket.on('join_room', ({ userId, astrologerId }) => {
        const room = `${userId}_${astrologerId}`;
        socket.join(room); // Join a room
        console.log(`${socket.id} joined room: ${room}`);
    });

    // Handle messages
    socket.on('message', async ({ room, message }) => {
        console.log(`Message to ${room}:`, message);
    
        // Save message to database
        await Chat.findOneAndUpdate(
            { room },
            { $push: { messages: { senderId: socket.id, text: message } } },
            { upsert: true, new: true }
        );
    
        // Broadcast the message to the room except the sender
        socket.to(room).emit('return_message', { text: message, senderId: socket.id });
    });

    socket.on('file_upload', async ({ room, fileData }) => {
        console.log(`File received in ${room}:`, fileData);
    
        // Save file to database
        await Chat.findOneAndUpdate(
            { room },
            { $push: { messages: { senderId: socket.id, file: fileData } } },
            { upsert: true, new: true }
        );
    
        // Broadcast the file to the room except the sender
        socket.to(room).emit('return_message', { text: 'Attachment received', file: fileData, senderId: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
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

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})