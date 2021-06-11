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
    phone: {
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
    sid: String
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

schema.virtual('supervisor', {
    ref: 'Supervisor',
    localField: 'sid',
    foreignField: 'uid'
})

const Designer = mongoose.model('Designer', schema)

module.exports = Designer