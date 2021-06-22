const validator = require('validator');
var ObjectId = require('mongoose').Types.ObjectId;

const CONFIG = require('../config/config');

const model = require('../models/designrequest.model').DesignRequest
const scheduledDRModel = require("../models/designrequest.model").ScheduledDesignRequest
const draftDRModel = require("../models/designrequest.model").DraftDesignRequest

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    var assets = []
    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    if (!ObjectId.isValid(req.body.brand)) {
        return res.status(400).send({ error: "Invalid ref. id" })
    }

    if (req.body.status) {
        return res.status(400).send({ error: "Cannot explicitly set status on creation" })
    }

    const dr = new scheduledDRModel({
        cid: req.uid,
        ...req.body,
        assets
    })

    try {
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        res.status(201).send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.add = add

const addScheduled = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: "Invalid ref. id" })
    }

    const scheduledDR = await scheduledDRModel.findOne({ _id: req.params.id })

    if (!scheduledDR) {
        return res.status(404).send({})
    }
    var scheduledDRJSON = scheduledDR.toJSON()

    delete scheduledDRJSON._id
    delete scheduledDRJSON.id

    const dr = new model(scheduledDRJSON)

    try {
        await dr.save()

        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')

        await scheduledDR.remove()
        res.status(201).send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.addScheduled = addScheduled

const addDraft = async (req, res) => {
    var assets = []
    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    if (!ObjectId.isValid(req.body.brand)) {
        return res.status(400).send({ error: "Invalid ref. id" })
    }

    if (req.body.status) {
        return res.status(400).send({ error: "Cannot explicitly set status on creation" })
    }

    const dr = new draftDRModel({
        cid: req.uid,
        ...req.body,
        assets
    })

    try {
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        res.status(201).send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.addDraft = addDraft

const forceDraft = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: "Invalid ref. id" })
    }

    const dr = await draftDRModel.findOne({ _id: req.params.id })

    if (!dr) {
        return res.status(404).send({})
    }
    var drJSON = dr.toJSON()

    delete drJSON._id
    delete drJSON.id

    const scheduledDr = new scheduledDRModel(drJSON)

    try {
        await scheduledDr.save()

        await scheduledDr.populate('brand')
            .populate('designer')
            .execPopulate()
        scheduledDr['assets'] = await preSigner(dr, 'assets')

        await dr.remove()
        res.status(201).send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.forceDraft = forceDraft

const read = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.find({ cid: req.uid }).lean()
            .populate('brand')
            .populate('designer')

        const designerQAStatus = ["qa-requested", "qa-rejected", "qa-customer-partial-rejected"]
        const supervisorQAStatus = ["qa-customer-partial", "qa-customer-full"]
        dr.map((elem) => {
            if (designerQAStatus.includes(elem.status)) {
                elem.status = "in-progress"
            } else if (supervisorQAStatus.includes(elem.status)) {
                elem.status = "qa-requested"
            }
            return elem
        })
        return res.send(dr)
    }

    if (req.role == 'designer') {
        const dr = await model.find({ did: req.uid })
            .populate('brand')
            .populate('designer')
        return res.send(dr)
    }

    const globalDr = await model.find().populate('brand')
        .populate('designer')

    res.send(globalDr)
}

module.exports.read = read

const readScheduled = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await scheduledDRModel.find({ cid: req.uid })
            .populate('brand')
            .populate('designer')
        return res.send(dr)
    }

    const globalDr = await scheduledDRModel.find().populate('brand')
        .populate('designer')
    res.send(globalDr)
}

module.exports.readScheduled = readScheduled

const readDraft = async (req, res) => {
    const dr = await draftDRModel.find({ cid: req.uid })
        .populate('brand')
        .populate('designer')
    res.send(dr)
}

module.exports.readDraft = readDraft

const readOne = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.findOne({
            cid: req.uid,
            _id: req.params.id
        }).lean()
            .populate('brand')
            .populate('designer')

        if (!dr) {
            return res.status(404).send({})
        }

        const designerQAStatus = ["qa-requested", "qa-rejected", "qa-customer-partial-rejected"]
        const supervisorQAStatus = ["qa-customer-partial", "qa-customer-full"]

        if (designerQAStatus.includes(dr.status)) {
            dr.status = "in-progress"
        } else if (supervisorQAStatus.includes(dr.status)) {
            dr.status = "qa-requested"
        }

        dr['assets'] = await preSigner(dr, 'assets')
        return res.send(dr)
    }

    const globalDr = await model.findOne({ _id: req.params.id })
        .populate('brand')
        .populate('designer')
    res.send(globalDr)
}

module.exports.readOne = readOne

const readOneScheduled = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await scheduledDRModel.findOne({
            cid: req.uid,
            _id: req.params.id
        })
            .populate('brand')
            .populate('designer')

        if (!dr) {
            return res.status(404).send({})
        }

        dr['assets'] = await preSigner(dr, 'assets')
        return res.send(dr)
    }

    const globalDr = await scheduledDRModel.findOne({ _id: req.params.id })
        .populate('brand')
        .populate('designer')

    if (!dr) {
        return res.status(404).send({})
    }

    globalDr['assets'] = await preSigner(globalDr, 'assets')
    res.send(globalDr)
}

module.exports.readOneScheduled = readOneScheduled

const update = async (req, res) => {
    const allowedFields = ["name", "description", "copywrite", "brand", "formats", "native", "sizes", "assets", "stockimages", "status"]
    const genericAllowedFields = ["status"]
    const updates = Object.keys(req.body)
    const dr = await model.findById(req.params.id)

    var assets = []
    var validOperation = false
    var statusValidation = false

    if (req.role == 'customer' || req.role == 'owner') {
        validOperation = updates.every((elem) => allowedFields.includes(elem))
    } else {
        validOperation = updates.every((elem) => genericAllowedFields.includes(elem))
    }

    if (req.body.status) {
        const customerAllowedStatus = ["qa-customer-partial-rejected", "qa-customer-full-rejected", "done", "rejected", "on-hold",
            "qa-customer-partial-approved", "request-revision"]
        const designerAllowedStatus = ["in-progress", "qa-requested", "designer-reject"]
        const supervisorAllowedStatus = ["qa-rejected", "qa-customer-partial", "qa-customer-full", "done", "supervisor-reject", "on-hold"]

        if (req.role == 'customer' && customerAllowedStatus.includes(req.body.status)) {
            statusValidation = true
        } else if (req.role == 'designer' && designerAllowedStatus.includes(req.body.status)) {
            statusValidation = true
        } else if (req.role == 'supervisor' && supervisorAllowedStatus.includes(req.body.status)) {
            statusValidation = true
        }
    }

    if (!validOperation || !statusValidation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    try {
        updates.forEach((elem) => dr[elem] = req.body[elem])
        dr['assets'] = dr['assets'].concat(assets)
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        res.send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const updateScheduled = async (req, res) => {
    const allowedFields = ["name", "description", "copywrite", "brand", "formats", "native", "sizes", "assets", "stockimages"]
    const updates = Object.keys(req.body)
    const dr = await scheduledDRModel.findById(req.params.id)

    var assets = []
    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    try {
        updates.forEach((elem) => dr[elem] = req.body[elem])
        dr['assets'] = dr['assets'].concat(assets)
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        res.send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.updateScheduled = updateScheduled

const updateDraft = async (req, res) => {
    const allowedFields = ["name", "description", "copywrite", "brand", "formats", "native", "sizes", "assets", "stockimages"]
    const updates = Object.keys(req.body)
    const dr = await draftDRModel.findById(req.params.id)

    var assets = []
    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    try {
        updates.forEach((elem) => dr[elem] = req.body[elem])
        dr['assets'] = dr['assets'].concat(assets)
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        res.send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.updateDraft = updateDraft

const remove = async (req, res) => {
    const dr = await model.findById(req.params.id)

    if (req.role == 'customer' && req.uid != dr.cid) {
        return res.status(401).send({ error: 'Access denied' })
    }

    try {
        await dr.remove()
        res.send(dr)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove

const removeScheduled = async (req, res) => {
    const dr = await scheduledDRModel.findById(req.params.id)

    if (req.role == 'customer' && req.uid != dr.cid) {
        return res.status(401).send({ error: 'Access denied' })
    }

    try {
        await dr.remove()
        res.send(dr)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.removeScheduled = removeScheduled

const removeDraft = async (req, res) => {
    const dr = await draftDRModel.findById(req.params.id)

    if (req.uid != dr.cid) {
        return res.status(401).send({ error: 'Access denied' })
    }

    try {
        await dr.remove()
        res.send(dr)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.removeDraft = removeDraft