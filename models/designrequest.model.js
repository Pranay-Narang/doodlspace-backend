const mongoose = require("mongoose")
const validator = require("validator")
const S3 = require('aws-sdk/clients/s3');

const CONFIG = require('../config/config');

const s3 = new S3({
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    endpoint: CONFIG.AWS_S3_BUCKET_ENDPOINT,
    s3ForcePathStyle: true
});

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

module.exports = DesignRequest