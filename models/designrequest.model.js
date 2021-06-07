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
    did: String,
    assets: Array,
    stockimages: Array,
    status: {
        type: String,
        enum: ["in-queue", "in-progress", "qa-requested", "qa-rejected",
            "qa-customer-partial", "qa-customer-full", "qa-customer-partial-rejected",
            "qa-customer-full-rejected", "done"],
        default: "in-queue"
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

schema.virtual('designer', {
    ref: 'Designer',
    localField: 'did',
    foreignField: 'uid',
    justOne: true
})

const DesignRequest = mongoose.model('DesignRequest', schema)
const ScheduledDesignRequest = mongoose.model('ScheduledDesignRequest', schema)

module.exports = { DesignRequest, ScheduledDesignRequest }