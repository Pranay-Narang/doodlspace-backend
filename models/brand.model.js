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

const socialSchema = new mongoose.Schema({
    instagram: String,
    facebook: String,
    linkedin: String,
    website: String
})

const fontSchema = new mongoose.Schema({
    name: String,
    family: String,
    variant: String,
    URL: String
})

const schema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: String,
        colors: Array,
        social: socialSchema,
        logo: Array,
        assets: Array,
        stockimages: Array,
        stockimagelinks: Array,
        inspirationallinks: [String],
        targetaudience: [String],
        fonts: [fontSchema]
    }
)

schema.methods.generatePreSignedURL = async function (subObject) {
    const objects = this[subObject].toObject()

    const objectURLs = objects.map(object => {
        const params = {
            Bucket: CONFIG.AWS_S3_BUCKET,
            Key: object,
            Expires: 60 * 5
        };
        return {name: object.split('\\').pop().split('/').pop(), link: s3.getSignedUrl('getObject', params)}
    })
    return objectURLs
}

const Brand = mongoose.model('Brand', schema)

module.exports = Brand