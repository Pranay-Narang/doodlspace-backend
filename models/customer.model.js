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
    },
    phone: {
        type: String,
        required: true
    },
    designers: [{ type: String, ref: 'Designer' }],
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

const Customer = mongoose.model('Customer', schema)

module.exports = Customer