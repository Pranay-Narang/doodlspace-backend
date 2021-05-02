const router = require('express').Router()
const S3 = require('aws-sdk/clients/s3');
const multer = require("multer")
const multers3 = require('multer-s3');

const controller = require('../controllers/brand.controller')

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
            cb(null, 'brands/uploads/' + req.uid + '/' + file.fieldname + '/' + file.originalname)
        }
    }),
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error('Please upload a PNG/JPG'))
        }

        cb(undefined, true)
    },
});

router.post('/brands', auth({ hasRole: ['customer'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
    { name: 'stockimages', maxCount: 10 }
]), controller.add)
router.get('/brands', auth({ hasRole: ['owner'] }), controller.read)
router.get('/brands/:id', auth({ hasRole: ['owner', 'designer', 'customer'] }), controller.readOne)
router.patch('/brands/:id', auth({ hasRole: ['customer', 'owner'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
    { name: 'stockimages', maxCount: 10 }
]), controller.update)
router.delete('/brands/:id', auth({ hasRole: ['owner'] }), controller.remove)

module.exports = router