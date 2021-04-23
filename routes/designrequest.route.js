const router = require('express').Router()
const S3 = require('aws-sdk/clients/s3');
const multer = require("multer")
const multers3 = require('multer-s3');

const controller = require('../controllers/designrequest.controller')

const auth = require('../middleware/auth.middleware')

const CONFIG = require('../config/config');

const s3 = new S3({
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    endpoint: CONFIG.AWS_S3_BUCKET_ENDPOINT,
    s3ForcePathStyle: true
});

const upload = multer({
    storage: multers3({
        s3: s3,
        acl: 'private',
        bucket: CONFIG.AWS_S3_BUCKET,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname })
        },

        key: (req, file, cb) => {
            cb(null, 'designrequests/uploads/' + req.uid + '/' + file.fieldname + '/' + file.originalname)
        }
    }),
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error('Please upload a PNG/JPG'))
        }

        cb(undefined, true)
    },
});

router.post('/designrequests', auth({ hasRole: ['customer'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
    { name: 'stockimages', maxCount: 10 }
]), controller.add)
router.get('/designrequests', auth({ hasRole: ['customer', 'owner'] }), controller.read)
router.get('/designrequests/:id', auth({hasRole: ['customer', 'owner']}), controller.readOne)

module.exports = router