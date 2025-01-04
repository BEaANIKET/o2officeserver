import { User } from "../models/user.models.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Post } from "../models/post.models.js";

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        console.log(fullName, email, password);

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const profilePicture = `https://avatar.iran.liara.run/public/boy`;

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashPassword,
            profilePicture
        });

        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

export const login = async (req, res) => {

    const { email, password } = req.body

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
        const options = {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV !== 'developement'
        }

        return res.status(200)
            .cookie('token', token, options)
            .json({
                message: 'Login successful',
                user: {
                    _id: user.id,
                    email: user.email,
                    profilePicture: user.profilePicture,
                },
                token: token,
            })

    } catch (error) {
        return res.status(500).json({ error: error.message, message: "internal server error" });
    }
}

export const Logout = async (req, res) => {
    try {
        const options = {
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: process.env.NODE_ENV !== 'developement'
        }
        res.clearCookie('token', options)
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
        })
    }
}

export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            message: 'Something went wrong',
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const data = req.body

        if (!data) {
            return res.status(400).json({ message: 'No data provided' });
        }
        const user = await User.findByIdAndUpdate(req.user._id, { ...data }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'Profile updated successfully', user });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Something went wrong',
        });
    }
}

export const post = async (req, res) => {
    try {
        const post = await Post.find({ userId: req.user._id });

        if (!post) {
            return res.status(404).json({ message: 'No posts found' });
        }

        return res.status(200).json({
            posts: post
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Something went wrong',
        })
    }
}