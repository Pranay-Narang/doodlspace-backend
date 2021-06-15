const validator = require('validator');
var ObjectId = require('mongoose').Types.ObjectId;

const CONFIG = require('../config/config');

const model = require('../models/comment.model')

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    const allowedFields = ["value", "attachments", "coordinates"]
    const updates = Object.keys(req.body)

    if (req.role != 'customer') {
        allowedFields.push("private")
    }

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    var attachments = []

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: "Invalid ref. id" })
    }

    if (req.files.attachments) {
        attachments = req.files.attachments.map(asset => asset.key)
    }

    if(req.body.attachments) {
        attachments = req.body.attachments
    }

    const comment = new model({
        designrequest: req.params.id,
        uid: req.uid,
        role: req['role'].charAt(0).toUpperCase() + req['role'].slice(1),
        ...req.body,
        attachments
    })

    try {
        await comment.save()
        comment['attachments'] = await preSigner(comment, 'attachments')
        res.status(201).send(comment)
    } catch (e) {
        return res.status(400).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    if (req.role == 'customer') {
        const publicComments = await model.find({ designrequest: req.params.id, private: false }).lean().populate('user', 'name')
        await Promise.all(publicComments.map(async elem => {
            elem['attachments'] = await preSigner(elem, 'attachments')
            return elem
        }))
        return res.send(publicComments)
    }

    const comments = await model.find({ designrequest: req.params.id }).lean().populate('user', 'name')
    await Promise.all(comments.map(async elem => {
        elem['attachments'] = await preSigner(elem, 'attachments')
        return elem
    }))
    return res.send(comments)
}

module.exports.read = read