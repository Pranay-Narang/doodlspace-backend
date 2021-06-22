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
        def: {type: String, default: "DR"},
        year: {type: String},
        seq: {type: Number}
    },
    assets: Array,
    stockimages: Array,
    status: {
        type: String,
        enum: ["in-queue", "in-progress", "qa-requested", "qa-rejected",
            "qa-customer-partial", "qa-customer-full", "qa-customer-partial-rejected",
            "qa-customer-full-rejected", "done", "designer-reject", "supervisor-reject",
            "rejected", "on-hold", "qa-customer-partial-approved", "request-revision"],
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

schema.plugin(AutoIncrement, {inc_field: 'drid.seq', disable_hooks: true})

const DesignRequest = mongoose.model('DesignRequest', schema)
const ScheduledDesignRequest = mongoose.model('ScheduledDesignRequest', schema)
const DraftDesignRequest = mongoose.model('DraftDesignRequest', schema)

module.exports = { DesignRequest, ScheduledDesignRequest, DraftDesignRequest }