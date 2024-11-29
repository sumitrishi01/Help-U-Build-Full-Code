const Review = require('../models/review.model');
const Provider = require('../models/providers.model');

exports.createReview = async (req, res) => {
    try {
        const { rating, review, providerId, userId } = req.body;

        if (!rating || !review || !providerId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'All fields (rating, review, providerId, userId) are required.'
            });
        }

        const vendor = await Provider.findById(providerId);

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating value must be between 1 and 5.'
            });
        }

        const newRating = new Review({
            rating,
            review,
            providerId,
            userId,
        });

        await newRating.save();

        const ratings = await Review.find({ providerId });
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const newAverageRating = (sumOfRatings / totalRatings).toFixed(1);

        await Review.updateMany(
            { providerId },
            { averageRating: newAverageRating }
        );

        vendor.averageRating = newAverageRating;
        await vendor.save();

        res.status(201).json({
            success: true,
            data: {
                rating: newRating,
                averageRating: newAverageRating
            },
            message: 'Rating created successfully and average rating updated.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.getAllReview = async (req, res) => {
    try {
        const reviews = await Review.find().populate('providerId').populate('userId');
        if (!reviews) {
            return res.status(400).json({
                success: false,
                message: 'No reviews found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Review retrieved successfully',
            data: reviews
        })
    } catch (error) {
        console.log("Internal server error in getAllReview");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getReviewByProviderId = async (req, res) => {
    try {
        const providerId = req.params._id;

        // Fetch reviews and populate provider details
        const reviews = await Review.find({ providerId: providerId })
            .populate('providerId'); // Proper populate usage

        // Check if no reviews exist
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No reviews found for this provider',
            });
        }

        // Send response with reviews
        res.status(200).json({
            success: true,
            message: 'Reviews retrieved successfully',
            data: reviews,
        });
    } catch (error) {
        console.log("Internal server error in getReviewByProviderId", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
