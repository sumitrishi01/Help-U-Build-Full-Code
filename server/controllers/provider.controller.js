const PortfolioModel = require("../models/Portfolio.model");
const providersModel = require("../models/providers.model");
const { UploaViaFeildNameImages, deleteImageFromCloudinary } = require("../utils/Cloudnary");
const sendEmail = require("../utils/SendEmail");
const sendToken = require("../utils/SendToken");
const bcrypt = require('bcrypt');
const Cloudinary = require('cloudinary').v2;
require('dotenv').config();

Cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    cloud_name: process.env.CLOUD_NAME,
});

exports.CreateProvider = async (req, res) => {
    try {
        // console.log("im hit")
        // console.log(req.files)
        const { adhaarCard, panCard, qualificationProof } = req.files || {};
        if (!adhaarCard || !panCard || !qualificationProof) {
            return res.status(400).json({
                success: false,
                message: 'All required documents (Adhaar, Pan Card, Qualification Proof) must be uploaded.'
            });
        }
        const { type, name, email, password, DOB, age, language, mobileNumber, gstDetails, coaNumber, expertiseSpecialization, location } = req.body;
        const existingMobile = await providersModel.findOne({ mobileNumber });
        const existingEmail = await providersModel.findOne({ email });


        if (existingEmail) {
            return res.status(403).json({
                message: 'Eamil is already exists with another account'
            })
        }
        if (existingMobile) {
            return res.status(403).json({
                success: false,
                message: 'Mobile Number already exists with another account'
            })
        }



        // Upload images to Cloudinary
        const uploadedFiles = {};
        if (adhaarCard) {
            uploadedFiles.adhaarCard = await uploadToCloudinary(adhaarCard[0].buffer);
        }
        if (panCard) {
            uploadedFiles.panCard = await uploadToCloudinary(panCard[0].buffer);
        }
        if (qualificationProof) {
            uploadedFiles.qualificationProof = await uploadToCloudinary(qualificationProof[0].buffer);
        }
        // if (photo) {
        //     uploadedFiles.photo = await uploadToCloudinary(photo[0].buffer);
        // }
        // console.log(uploadedFiles)
        const newProvider = new providersModel({
            DOB,
            type,
            name,
            email,
            password: password,
            age,
            // language: language.split(','),
            mobileNumber,
            gstDetails,
            coaNumber,
            // expertiseSpecialization: expertiseSpecialization.split(','),
            location,
            // photo: uploadedFiles.photo,
            adhaarCard: uploadedFiles.adhaarCard,
            panCard: uploadedFiles.panCard,
            qualificationProof: uploadedFiles.qualificationProof
        });

        // Save the provider
        await newProvider.save();

        // Send welcome email
        const emailOptions = {
            email: email,
            subject: "Welcome to HelpUBuild",
            message: "Hello, Welcome to HelpUBuild! We are excited to have you on board. Please find your login details below.",
        }
        await sendEmail(emailOptions);

        // Send token for authentication
        sendToken(newProvider, res, 201, "Account Created successfully");

    } catch (error) {
        console.error("Error creating provider:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the provider. Please try again later.",
            error: error.message
        });
    }
};

exports.GetMyProfile = async (req, res) => {
    try {
        console.log(req.user)
        const userId = req.user.id._id;
        console.log(req.user.id)
        if (!userId) {
            return res.status(401).json({ message: 'Please login To Access Your Dashboard ' });
        }
        const provider = await providersModel.findById(userId)
            .populate('portfolio')
            .populate('chatTransition.user');

        // console.log(provider)
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        return res.status(200).json({
            message: 'Profile fetched successfully',
            provider: provider
        });
    } catch (error) {
        console.error(error);
        // Handle any errors that occur
        return res.status(500).json({
            message: 'Something went wrong while fetching the profile',
            error: error.message || 'Internal server error'
        });
    }
};

exports.addPortfolio = async (req, res) => {
    try {
        const ProviderId = req.user.id._id
        const { TextWhichYouShow, type } = req.query;



        // Check if the provider exists
        const checkProviderId = await providersModel.findById(ProviderId);
        if (!checkProviderId) {
            return res.status(404).json({
                success: false,
                message: "Provider not found. Please check the ID and try again."
            });
        }

        let PortfolioLink = {};
        let GalleryImages = [];
        let isGalleryUploaded = false;


        let existingPortfolio = await PortfolioModel.findOne({ ProviderId });


        if (type === 'Portfolio') {
            if (req.files && req.files.PortfolioLink) {
                const fileBuffer = req.files.PortfolioLink[0].buffer;


                const uploadResult = await uploadToCloudinary(fileBuffer);
                PortfolioLink = {
                    url: uploadResult.imageUrl,
                    cloudinary_id: uploadResult.public_id
                };

                if (existingPortfolio) {

                    existingPortfolio.PortfolioLink = PortfolioLink;
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded for PortfolioLink."
                });
            }
        }
        else if (type === 'Gallery') {
            if (req.files && req.files.GalleryImages) {
                for (let i = 0; i < req.files.GalleryImages.length; i++) {
                    const fileBuffer = req.files.GalleryImages[i].buffer;


                    const uploadResult = await uploadToCloudinary(fileBuffer);
                    GalleryImages.push({
                        url: uploadResult.imageUrl,
                        cloudinary_id: uploadResult.public_id
                    });
                }

                if (GalleryImages.length > 0) {
                    isGalleryUploaded = true;
                }

                if (existingPortfolio) {
                    // Update the existing portfolio if it exists
                    existingPortfolio.GalleryImages = GalleryImages;
                    existingPortfolio.isGalleryUploaded = isGalleryUploaded;
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded for GalleryImages."
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid type provided. Must be 'Portfolio' or 'Gallery'."
            });
        }

        // If no existing portfolio, create a new one
        if (!existingPortfolio) {
            existingPortfolio = new PortfolioModel({
                TextWhichYouShow,
                PortfolioLink,
                GalleryImages,
                isGalleryUploaded,
                ProviderId
            });
        }

        // Save the portfolio (either new or updated)
        await existingPortfolio.save();

        // Associate the portfolio with the provider
        checkProviderId.portfolio = existingPortfolio._id;
        await checkProviderId.save();

        // Send a success response
        return res.status(201).json({
            success: true,
            message: "Portfolio updated successfully",
            data: existingPortfolio
        });

    } catch (error) {
        console.error("Error adding portfolio:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while adding or updating the portfolio."
        });
    }
};

exports.getAllProvider = async (req, res) => {
    try {
        const providers = await providersModel.find().populate('portfolio').exec();
        if (!providers) {
            return res.status(404).json({
                success: false,
                message: "No providers found."
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Provider founded successfully',
            data: providers
        });
    } catch (error) {
        console.log("Internal server error in getAllProvider");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleProvider = async (req, res) => {
    try {
        const providerId = req.params._id;
        const provider = await providersModel
            .findById(providerId)
            .populate('portfolio')
            .populate({
                path: 'chatTransition',
                populate: {
                    path: 'user', // Field inside chatTransition to populate
                    model: 'User', // Replace with your user model name if different
                },
            })
            .exec();
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }
        res.status(200).json({
            success: true,
            message: 'Provider founded successfully',
            data: provider
        })
    } catch (error) {
        console.log("Internal server error in getting provider", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error in getting provider',
            error: error.message
        })
    }
}

exports.updateProvider = async (req, res) => {
    // console.log("i am hit")
    try {
        const providerId = req.params._id;
        const {
            name,
            email,
            DOB,
            language,
            mobileNumber,
            coaNumber,
            location,
            pricePerMin,
            bio,
            expertiseSpecialization,
            yearOfExperience
        } = req.body;

        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }

        // Update only provided fields
        if (name) provider.name = name;
        if (email) provider.email = email;
        if (DOB) provider.DOB = DOB;
        if (language) provider.language =
            typeof language === 'string'
                ? language.split(', ')
                : language;
        if (mobileNumber) provider.mobileNumber = mobileNumber;
        if (coaNumber) provider.coaNumber = coaNumber;
        if (location) provider.location = location;
        if (pricePerMin) provider.pricePerMin = pricePerMin;
        if (bio) provider.bio = bio;
        if (expertiseSpecialization) {
            provider.expertiseSpecialization =
                typeof expertiseSpecialization === 'string'
                    ? expertiseSpecialization.split(', ')
                    : expertiseSpecialization;
        }

        // Calculate age if DOB is updated
        if (DOB) {
            const birthDate = new Date(DOB);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            provider.age = age;
        }
        if (yearOfExperience) provider.yearOfExperience = yearOfExperience

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Provider updated successfully.",
            provider
        });
    } catch (error) {
        console.log("Internal server error in update provider", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error in update provider',
            error: error.message
        });
    }
};

exports.updateDocuments = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const existingData = await providersModel.findById(providerId)
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
                error: "Provider not found"
            });
        }
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.',
                error: 'No file uploaded.'
            })
        }
        if (req.files) {
            const { adhaarCard, panCard, qualificationProof, photo } = req.files;
            if (adhaarCard) {
                if (existingData?.adhaarCard?.public_id) {
                    await deleteImageFromCloudinary(existingData.adhaarCard.public_id)
                }
                const adhaarCardUrl = await uploadToCloudinary(adhaarCard[0].buffer);
                const { imageUrl, public_id } = adhaarCardUrl
                existingData.adhaarCard = { public_id, imageUrl: imageUrl }
            }

            if (panCard) {
                if (existingData?.panCard?.public_id) {
                    await deleteImageFromCloudinary(existingData.panCard.public_id)
                }
                const panCardUrl = await uploadToCloudinary(panCard[0].buffer);
                const { imageUrl, public_id } = panCardUrl
                existingData.panCard = { public_id, imageUrl: imageUrl }
            }

            if (qualificationProof) {
                if (existingData?.qualificationProof?.public_id) {
                    await deleteImageFromCloudinary(existingData.qualificationProof.public_id)
                }
                const qualificationProofUrl = await uploadToCloudinary(qualificationProof[0].buffer);
                const { imageUrl, public_id } = qualificationProofUrl
                existingData.qualificationProof = { public_id, imageUrl: imageUrl }
            }

            if (photo) {
                if (existingData?.photo?.public_id) {
                    await deleteImageFromCloudinary(existingData.photo.public_id)
                }
                const photoUrl = await uploadToCloudinary(photo[0].buffer);
                const { imageUrl, public_id } = photoUrl
                existingData.photo = { public_id, imageUrl: imageUrl }
            }
        }
        await existingData.save();
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: existingData
        })
    } catch (error) {
        console.log("Internal server error in updating documents", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error in updating documents',
            error: error.message
        });
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { password, newPassword } = req.body;
        // const excitedData = await providerId.({ providerId });
        const existingData = await providersModel.findById(providerId);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found'
            });
        }
        const isMatch = await existingData.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please Enter Correct Password." });
        }
        existingData.password = newPassword;
        await existingData.save();
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.',
            data: existingData
        })

    } catch (error) {
        console.log("Internal server error in updating password", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error in updating password',
            error: error.message
        })
    }
}

exports.updateAvailable = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { chatStatus, callStatus, meetStatus } = req.body;

        console.log("body", req.body);

        const existingData = await providersModel.findById(providerId);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }

        // Update statuses only if they are explicitly defined in the request body
        if (typeof chatStatus !== 'undefined') existingData.chatStatus = chatStatus;
        if (typeof callStatus !== 'undefined') existingData.callStatus = callStatus;
        if (typeof meetStatus !== 'undefined') existingData.meetStatus = meetStatus;

        await existingData.save();

        return res.status(200).json({
            success: true,
            message: 'Provider status updated successfully.',
            data: existingData,
        });
    } catch (error) {
        console.log('Internal server error in updating', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.updateBankDetail = async (req, res) => {
    try {
        const { providerId } = req.params;
        const {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
            panCardNumber
        } = req.body;

        // Validate input
        if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !branchName || !panCardNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Find the provider
        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        // Check if bank details already exist
        if (provider.bankDetail && Object.keys(provider.bankDetail).length > 0) {
            // Update only the provided fields
            provider.bankDetail.accountHolderName = accountHolderName;
            provider.bankDetail.bankName = bankName;
            provider.bankDetail.accountNumber = accountNumber;
            provider.bankDetail.ifscCode = ifscCode;
            provider.bankDetail.branchName = branchName;
            provider.bankDetail.panCardNumber = panCardNumber;
        } else {
            // Create new bank details
            provider.bankDetail = {
                accountHolderName,
                bankName,
                accountNumber,
                ifscCode,
                branchName,
                panCardNumber,
            };
        }

        // Save the updated provider
        await provider.save();

        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully',
            bankDetail: provider.bankDetail,
        });
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.updateIsBanned = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const isBanned = req.body.isBanned;
        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }
        provider.isBanned = isBanned;
        await provider.save();
        res.status(200).json({
            success: true,
            message: 'Provider banned status updated successfully',
            isBanned: provider.isBanned,
        });

    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

exports.deleteprovider = async (req, res) => {
    // console.log("i am hit")
    try {
        const { id } = req.params;
        const findProvider = await providersModel.findByIdAndDelete(id)
        if (!findProvider) {
            return res.status(500).json({
                success: false,
                message: "Provider nout founded",
                error: "Provider nout founded"
            })
        }
        res.status(200).json({
            success: true,
            message: "Provider deleted successfully",
        })
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = Cloudinary.uploader.upload_stream(
            { folder: process.env.CLOUDINARY_FOLDER_NAME },
            (error, result) => {
                if (result) {
                    resolve({ public_id: result.public_id, imageUrl: result.secure_url });
                } else {
                    reject(error || new Error("Failed to upload image"));
                }
            }
        );
        stream.end(fileBuffer);
    });
};
