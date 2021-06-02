const mongoose = require("mongoose")
const validator = require("validator")

const schema = new mongoose.Schema({
    designrequest: { type: String, ref: 'DesignRequest', required: true },
    private: { type: Boolean, default: false },
    attachments: [String],
    uid: { type: String },
    value: String,
    role: {
        type: String,
        required: true,
        enum: ['Customer', 'Designer', 'Owner', 'Supervisor']
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

schema.virtual('user', {
    refPath: 'role',
    localField: 'uid',
    foreignField: 'uid',
    justOne: true
})

const Comment = mongoose.model('Comment', schema)
module.exports = Comment