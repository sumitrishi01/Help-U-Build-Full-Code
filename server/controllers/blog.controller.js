const Blog = require('../models/blog.model');
const { uploadToCloudinary } = require('../utils/Cloudnary');

exports.createBlog = async (req, res) => {
    try {
        const { title, content, } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" })
        }
        if (!content) {
            return res.status(400).json({ message: "Content is required" })
        }
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file"
            })
        }

        const { image, largeImage } = req.files;
        const Images = {}
        if (image) {

            // const { imageUrl, public_id } = uploadToCloudinary(req.file.buffer)
            Images.smallImage = await uploadToCloudinary(image[0].buffer)
        }

        if (largeImage) {
            largeImage.image = await uploadToCloudinary(largeImage[0].buffer)
        }

        const blog = new Blog({
            title,
            content,
            image: {
                url: Images.smallImage.imageUrl,
                public_id: Images.smallImage.public_id
            },
            largeImage: {
                url: largeImage.image.imageUrl,
                public_id: largeImage.image.public_id
            }
        })

        await blog.save();
        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog
        })

    } catch (error) {
        console.log("Internal server error in creating blog", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllBlog = async (req, res) => {
    try {
        const blogs = await Blog.find();
        if (!blogs) {
            return res.status(400).json({
                success: false,
                message: "No blogs found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Blogs retrieved successfully",
            data: blogs
        })
    } catch (error) {
        console.log("Internal server error in getting all blogs", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(400).json({
                success: false,
                message: "Blog not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Blog retrieved successfully",
            data: blog
        })

    } catch (error) {
        console.log("Internal server error in getting blogs", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}