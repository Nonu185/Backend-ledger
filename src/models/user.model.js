const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        lowercase: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true    
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    systemUser: {
        type: Boolean,
        default: false,
        select: false,
        immutable: true
    }
},{
    timestamps:true
});

// Hash the password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return;
});

// Compare password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const usermodel = mongoose.model('User', userSchema);

module.exports = usermodel;