const { model, Schema } = require('mongoose');

const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;

const userSchema = Schema({
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    email: {
        type: String,
        match: emailRegexp,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
        default: null,
    },
    avatarURL: {
        type: String,
        default: null,
    },
    verificationToken :{ 
        type: String,
        required: [true, 'Verify token is required'],},
    verify:{
        type: Boolean,
        enum: [true, false],
        default: false,}
}, { versionKey: false });

const User = model("user", userSchema);

module.exports = User;