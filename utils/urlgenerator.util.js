const S3 = require('aws-sdk/clients/s3');

const CONFIG = require('../config/config');

const s3 = new S3({
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    endpoint: CONFIG.AWS_S3_BUCKET_ENDPOINT,
    s3ForcePathStyle: true
});

const generator = async (object, subObject) => {
    const values = object[subObject].toObject()

    const objectURLs = values.map(value => {
        const params = {
            Bucket: CONFIG.AWS_S3_BUCKET,
            Key: value,
            Expires: 60 * 5
        };
        return { name: value, link: s3.getSignedUrl('getObject', params) }
    })
    return objectURLs
}

module.exports = generator