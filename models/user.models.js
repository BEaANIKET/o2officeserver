import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    backgroundCover: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/008/996/859/non_2x/abstract-minimal-earth-tone-long-banner-template-organic-shapes-floral-and-leaves-background-with-copy-space-for-text-facebook-cover-free-vector.jpg'
    }

}, { timestamps: true });


export const User = mongoose.model('User', UserSchema);
