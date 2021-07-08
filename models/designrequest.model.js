const mongoose = require("mongoose")
const validator = require("validator")
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
    drid: {
        def: { type: String, default: "DR" },
        year: { type: String },
        seq: { type: Number }
    },
    assets: Array,
    stockimages: Array,
    prevstatus: String,
    status: {
        type: String,
        enum: ["open", "in-queue", "designer-reject", "supervisor-reject-approved",
            "in-progress", "awaiting-response", "qa-supervisor", "qa-supervisor-rejected",
            "qa-supervisor-partial-approved", "qa-supervisor-full-approved", "submitted",
            "request-revision", "completed", "on-hold"],
        default: "open"
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

schema.plugin(AutoIncrement, { inc_field: 'drid.seq', disable_hooks: true })

const DesignRequest = mongoose.model('DesignRequest', schema)
const ScheduledDesignRequest = mongoose.model('ScheduledDesignRequest', schema)
const DraftDesignRequest = mongoose.model('DraftDesignRequest', schema)

module.exports = { DesignRequest, ScheduledDesignRequest, DraftDesignRequest }