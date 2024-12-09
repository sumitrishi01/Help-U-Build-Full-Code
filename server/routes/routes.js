const express = require('express');
const { registeruser, getAllUsers, getSingleUserById, updateProfile, login, logout, deleteAccount, banUserToggle, verifyEmail, resendOtp, forgotPassword, getUserById, createPayment, PaymentVerify } = require('../controllers/user.Controller');
const { protect } = require('../middlewares/Protect');
const { CreateProvider, GetMyProfile, addPortfolio, getAllProvider, getSingleProvider, updateProvider, updateDocuments, updatePassword, updateAvailable } = require('../controllers/provider.controller');
const multer = require('multer');
const { getAllChat } = require('../controllers/ChatController');
const { createReview, getAllReview, getReviewByProviderId } = require('../controllers/review.Controller');
const { createBanner, getAllBanner, deleteBanner, updateBannerActiveStatus } = require('../controllers/banner.Controller');
const { createDescribeWork, getAllDescribeWork, deleteDescribeWork, updateWorkActiveStatus } = require('../controllers/describeWork.controller');
const { createplanJourneyImage, getAllJourneyImage, deleteJourneyImage, updatePlanActiveStatus } = require('../controllers/planJourneyImage.controller');
const { createAboutImage, getAllAboutImage, deleteAboutImage, updateAboutActiveStatus } = require('../controllers/aboutImage.controller');
const { createTestimonial, getAllTestimonial, getsingleTestimonial, deleteTestimonial, updateTestimonial, updateTestimonialActiveStatus } = require('../controllers/testimonial.controller');
const { createBlog, getAllBlog, getSingleBlog, updateBlog, deleteBlog } = require('../controllers/blog.controller');
const { createBlogComment, getAllComments, getBlogCommentByBlogId, deleteBlogComment } = require('../controllers/blogCommont.controller');
const { createChatWithNew, getAllChatRecord, getChatByProviderid, getChatByUserid, getChatById } = require('../controllers/chatAndPayment.Controller');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();


//User registration related routes
router.post('/register', registeruser);
router.put('/user/update-profile', protect, updateProfile);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/verify/:type', verifyEmail);
router.post('/resend-otp/:type', resendOtp);
router.post('/forgot-password', forgotPassword);
router.get('/get-user-by-id/:id', getUserById);

//providers registration related routes
router.post(
    '/register-provider',
    (req, res, next) => {
        upload.fields([
            { name: 'adhaarCard', maxCount: 2 },
            { name: 'panCard', maxCount: 1 },
            { name: 'qualificationProof', maxCount: 1 },
            { name: 'photo', maxCount: 1 }

        ])(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
                    error: err.message
                });
            }
            next();
        });
    },
    CreateProvider
);
router.put('/update-provider-documents/:providerId', upload.fields([
    { name: 'adhaarCard', maxCount: 2 },
    { name: 'panCard', maxCount: 1 },
    { name: 'qualificationProof', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), updateDocuments)
router.put('/update-provider-profile/:_id', updateProvider)
router.put('/update-provider-password/:providerId', updatePassword)
router.get('/GetMyProfile', protect, GetMyProfile)
router.get('/get-single-provider/:_id', getSingleProvider)
router.post('/addPortfolio', protect, (req, res, next) => {
    upload.fields([
        { name: 'PortfolioLink', maxCount: 1 },
        { name: 'GalleryImages', maxCount: 10 },


    ])(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message
            });
        }
        next();
    });
}, addPortfolio)
router.get('/get-all-provider', getAllProvider)






//admin routes
router.get('/users', protect, getAllUsers);
router.get('/user/:id', protect, getSingleUserById);
router.delete('/user/:userId', protect, deleteAccount);
router.put('/user/:userId/ban', protect, banUserToggle);

router.get('/get-all-chat', getAllChat)

// provider rating router here 

router.post('/create-rating', createReview)
router.get('/get-all-review', getAllReview)
router.get('/get-review-by-providerId/:_id', getReviewByProviderId)

// banner router here 

router.post('/create-banner', upload.single('bannerImage'), createBanner)
router.get('/get-all-banner', getAllBanner)
router.delete('/delete-banner/:id', deleteBanner)
router.put('/update-banner-status/:id', updateBannerActiveStatus)

// describe work router here 

router.post('/create-describe-work-image', upload.single('image'), createDescribeWork)
router.get('/get-all-describe-work-image', getAllDescribeWork)
router.delete('/delete-describe-work-image/:id', deleteDescribeWork)
router.put('/update-work-banner-status/:id', updateWorkActiveStatus)

// plan journey router here 

router.post('/create-plan-journey-image', upload.single('image'), createplanJourneyImage)
router.get('/get-all-plan-journey-image', getAllJourneyImage)
router.delete('/delete-plan-journey-image/:id', deleteJourneyImage)
router.put('/update-plan-banner-status/:id', updatePlanActiveStatus)

// about image router here
router.post('/create-about-image', upload.single('image'), createAboutImage)
router.get('/get-all-about-image', getAllAboutImage)
router.delete('/delete-about-image/:id', deleteAboutImage)
router.put('/update-about-banner-status/:id', updateAboutActiveStatus)

// testimonial router here 

router.post('/create-testimonial', upload.single('image'), createTestimonial)
router.get('/get-all-testimonial', getAllTestimonial)
router.get('/get-single-testimonial/:id', getsingleTestimonial)
router.delete('/delete-testimonial/:id', deleteTestimonial)
router.put('/update-testimonial/:id', upload.single('image'), updateTestimonial)
router.put('/update-testimonial-status/:id', updateTestimonialActiveStatus)

// blog router here 

router.post('/create-blog', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'largeImage', maxCount: 1 },
]), createBlog)

router.get('/get-all-blog', getAllBlog)
router.get('/get-single-blog/:id', getSingleBlog)
router.put('/update-blog/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'largeImage', maxCount: 1 },
]), updateBlog)
router.delete('/delete-blog/:id', deleteBlog)

// blog comment router here 

router.post('/create-blog-comment', createBlogComment)
router.get('/get-all-blog-comment', getAllComments),
    router.get('/get-comment-by-blogId/:blogId', getBlogCommentByBlogId)
router.delete('/delete-blog-comment/:id', deleteBlogComment)

// create Chat router 

router.post('/create-chat', createChatWithNew)
router.get('/get-all-chat-record', getAllChatRecord)
router.get('/get-chat-by-providerId/:providerId', getChatByProviderid)
router.get('/get-chat-by-userId/:userId', getChatByUserid)
router.get('/get-chat-by-id/:id', getChatById)
router.put('/update-available-status/:providerId', updateAvailable)

// recharge route here 
router.post('/create-payment/:userId', createPayment);
router.post('/verify-payment', PaymentVerify);

module.exports = router;