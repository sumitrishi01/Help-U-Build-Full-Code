const DescribeWork = require('../models/describeWork.model');
const { uploadToCloudinary, deleteImageFromCloudinary } = require('../utils/Cloudnary');

exports.createDescribeWork = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image',
            });
        }

        const uploadedImage = await uploadToCloudinary(req.file.buffer);

        const describeWork = new DescribeWork({
            image: {
                url: uploadedImage.imageUrl,
                public_id: uploadedImage.public_id
            }
        })

        await describeWork.save();

        res.status(200).json({
            success: true,
            message: 'Describe work created successfully',
            data: describeWork
        })

    } catch (error) {
        console.log("Internal server error in createDescribeWork", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in creating describe work",
            error: error.message
        })
    }
}

exports.getAllDescribeWork = async (req, res) => {
    try {
        const describeWork = await DescribeWork.find()
        if (!describeWork) {
            return res.status(404).json({
                success: false,
                message: 'No describe work found',
            })
        }
        res.status(200).json({
            success: true,
            message: ' Describe work retrieved successfully',
            data: describeWork
        })
    } catch (error) {
        console.log("Internal server error in getting all describe work", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in getting all describe work",

        })
    }
}

exports.deleteDescribeWork = async (req, res) => {
    try {
        const { id } = req.params;
        const describeWork = await DescribeWork.findByIdAndDelete(id)
        if (!describeWork) {
            return res.status(404).json({
                success: false
            })
        }
        if(describeWork?.image?.public_id){
            deleteImageFromCloudinary(describeWork.image.public_id)
        }
        res.status(200).json({
            success: true,
            message: 'Describe work deleted successfully',
        })

    } catch (error) {
        console.log("Internal server error in deleting describe work", error)
        res.status(500).json({
            success: false,
            message: ' Internal server error in deleting describe work',
            error: error.message
        })
    }
}