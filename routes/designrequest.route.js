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
    // fileFilter(req, file, cb) {
    //     if (!file.originalname.match(/\.(png|jpg)$/)) {
    //         return cb(new Error('Please upload a PNG/JPG'))
    //     }

    //     cb(undefined, true)
    // },
});

router.post('/designrequests', auth({ hasRole: ['customer'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
]), controller.add)
router.get('/designrequests', auth({ hasRole: ['customer', 'owner', 'designer'] }), controller.read)
router.get('/designrequests/:id', auth({ hasRole: ['customer', 'owner'] }), controller.readOne)
router.patch('/designrequests/:id', auth({ hasRole: ['customer', 'owner', 'supervisor', 'designer'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
]), controller.update)
router.delete('/designrequests/:id', auth({ hasRole: ['customer', 'owner'] }), controller.remove)

router.post('/scheduled/designrequests/:id', auth({ hasRole: ['owner'] }), controller.addScheduled)
router.get('/scheduled/designrequests', auth({ hasRole: ['customer', 'owner'] }), controller.readScheduled)
router.get('/scheduled/designrequests/:id', auth({ hasRole: ['customer', 'owner'] }), controller.readOneScheduled)
router.patch('/scheduled/designrequests/:id', auth({ hasRole: ['customer', 'owner'] }), upload.fields([
    { name: 'assets', maxCount: 10 },
]), controller.updateScheduled)
router.delete('/scheduled/designrequests/:id', auth({hasRole: ['customer', 'owner']}), controller.removeScheduled)

module.exports = router