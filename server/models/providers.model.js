const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ProviderProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    email: {
        type: String,
        // required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    photo: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    age: {
        type: Number,
        min: 0
    },
    DOB: {
        type: Date
    },
    language: {
        type: [String],
        default: []
    },
    mobileNumber: {
        type: String,
    },
    adhaarCard: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    panCard: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    gstDetails: {
        type: String,
        default: null
    },
    coaNumber: {
        type: String
    },
    qualificationProof: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio'
    },
    expertiseSpecialization: {
        type: [String],
        default: []
    },
    gallery: [
        {
            imageUrl: {
                type: String
            },
            public_id: String
        }
    ],
    location: {
        type: String
    },
    role: {
        type: String,
        default: 'provider'
    },
    type: {
        type: String,
        enum: ["Architect", "Interior", "Vastu"],
        required: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    averageRating: {
        type: Number
    },
    pricePerMin: {
        type: Number
    },
    roomId: {
        type: String
    },
    bio: {
        type: String
    }
});

// Password hashing
ProviderProfileSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to check password validity
ProviderProfileSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Provider', ProviderProfileSchema);
