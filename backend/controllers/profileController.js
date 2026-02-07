const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            phone: user.phone,
            profileImage: user.profileImage,
            bio: user.bio,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/profile/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.department = req.body.department || user.department;
        user.phone = req.body.phone || user.phone;
        user.bio = req.body.bio || user.bio;
        user.profileImage = req.body.profileImage || user.profileImage;

        // Validation
        if (req.body.phone && (req.body.phone.length < 10 || req.body.phone.length > 15)) {
            res.status(400);
            throw new Error('Phone number must be between 10 and 15 characters');
        }

        if (req.body.bio && req.body.bio.length > 200) {
            res.status(400);
            throw new Error('Bio cannot exceed 200 characters');
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            phone: updatedUser.phone,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            token: req.headers.authorization.split(' ')[1] // Optional: return existing token for convenience
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Upload profile image
// @route   POST /api/profile/image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (req.file) {
            // Update profileImage URL
            // Assuming server is running on localhost:5000 or similar, we store relative path
            // Frontend can prepend base URL
            user.profileImage = `/uploads/${req.file.filename}`;
            const updatedUser = await user.save();
            res.json({
                message: 'Image uploaded successfully',
                profileImage: updatedUser.profileImage
            });
        } else {
            res.status(400);
            throw new Error('No image file provided');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { getProfile, updateProfile, uploadProfileImage };
