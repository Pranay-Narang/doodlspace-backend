const mongoose = require('mongoose')
const validator = require('validator')

const schema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('Invalid email')
        },
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
})

const Owner = mongoose.model('Owner', schema)

module.exports = Owner