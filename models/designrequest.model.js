const mongoose = require("mongoose")
const validator = require("validator")

const schema = new mongoose.Schema({
    cid: String,
    name: String,
    description: String,
    copywrite: String,
    brand: {
        type: String,
        ref: 'Brand',
    },
    formats: Array,
    native: String,
    sizes: Array,
    designer: {
        type: String,
        ref: 'Designer'
    },
    assets: Array,
    stockimages: Array
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

const DesignRequest = mongoose.model('DesignRequest', schema)
const ScheduledDesignRequest = mongoose.model('ScheduledDesignRequest', schema)

module.exports = {DesignRequest, ScheduledDesignRequest}