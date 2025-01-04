import cloudinary from "../config/cloudinaryConfig.js";
import { Likes } from "../models/like.models.js";
import { Post } from "../models/post.models.js";
import fs from 'fs'

// Add Post
export const addPost = async (req, res) => {
    try {
        const { title, description, file, caption, price, category, location } = req.body;
        const post = new Post({
            title,
            description,
            file,
            caption,
            price,
            category,
            location,
            userId: req.user._id,
        });

        await post.save();
        return res.status(201).json({
            message: "Post created successfully",
            post,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
}

// Update Post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.query;
        const { data } = req.body;
        console.log(id, data);


        const post = await Post.findByIdAndUpdate(id, {
            ...data
        }, { new: true });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        return res.status(200).json({
            message: "Post updated successfully",
            post,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
}

// Delete Post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.query;

        const post = await Post.findByIdAndDelete(id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        return res.status(200).json({
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
}

export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 3;
        const skip = (page - 1) * limit;

        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    "user.password": 0,
                    "user.email": 0,
                    "user.createdAt": 0,
                    "user.updatedAt": 0,
                    "user.backgroundCover": 0,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        const totalPosts = await Post.countDocuments();

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
};



export const uploadFile = async (req, res) => {
    try {

        console.log(req.body);

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'o2office',
            resource_type: "auto",
            transformation: [
                { width: 500, crop: "scale" },
                { quality: 'auto' },
                { fetch_format: "auto" }
            ]
        });

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            message: "File uploaded and compressed successfully",
            file: {
                url: result.secure_url,
                fileType: result.format,
                publicId: result.public_id,
            },
        });
    } catch (error) {
        console.error(error);
        if (req.file?.path) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
};


export const likePost = async (req, res) => {
    try {
        const { postId } = req.query;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const like = await Likes.findOneAndDelete({ userId, postId });
        if (like) {
            post.likes = Math.max(post.likes - 1, 0);
        } else {
            await Likes.create({ userId, postId });
            post.likes += 1;
        }

        await post.save();

        return res.status(200).json({
            message: like ? "Post unliked successfully" : "Post liked successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
};


// Dislike a post
export const dislikePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const existingLike = await Likes.findOne({ userId, postId });
        if (!existingLike) {
            return res.status(400).json({
                message: "You have not liked this post",
            });
        }

        await Likes.findByIdAndDelete(existingLike._id);
        post.likes -= 1;
        await post.save();

        return res.status(200).json({
            message: "Post disliked successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
}

// Get likes for a post
export const getLikes = async (req, res) => {
    try {
        const { postId } = req.query;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const likesCount = await Likes.countDocuments({ postId });
        const isCurrUserLiked = await Likes.exists({ postId, userId });

        return res.status(200).json({
            message: "Likes retrieved successfully",
            likesCount,
            isCurrUserLiked: !!isCurrUserLiked,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
}
