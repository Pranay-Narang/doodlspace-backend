const mongoose = require('mongoose')
const validator = require('validator')

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
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
    number: {
        type: String,
        required: true
    },
    GSTIN: {
        type: String,
        required: true
    },
    employees: {
        type: String,
        enum: ['Only me', '2-20', '21-50', '51-100', '100+'],
        required: true
    },
    industry: {
        type: String
    },
    showcase: {
        type: Boolean
    },
    social: {
        instagram: {
            type: String
        },
        facebook: {
            type: String
        },
        website: {
            type: String
        }
    },
    description: {
        type: String
    },
    designpreferences: {
        type: [String],
        enum: ['Social Media Creatives', 'Print Collaterals', 'Outdoor Creatives', 'Website banners', 'graphics', 'Merchandise', 'Infographics']
    }
})

const addressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: true
    },
    line2: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    }
})

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
    company: companySchema,
    address: addressSchema
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

const Customer = mongoose.model('Customer', schema)

module.exports = Customer