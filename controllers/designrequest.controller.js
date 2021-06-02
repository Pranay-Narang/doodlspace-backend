const validator = require('validator');
var ObjectId = require('mongoose').Types.ObjectId;

const CONFIG = require('../config/config');

const model = require('../models/designrequest.model').DesignRequest
const scheduledDRModel = require("../models/designrequest.model").ScheduledDesignRequest

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    var assets = []
    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    if (!ObjectId.isValid(req.body.brand) || !ObjectId.isValid(req.body.designer)) {
        return res.status(400).send({ error: "Invalid ref. id" })
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
    
    const scheduledDR = await scheduledDRModel.findOne({_id: req.params.id})

    if(!scheduledDR) {
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

const read = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.find({ cid: req.uid })
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

const readOne = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.findOne({
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
    const allowedFields = ["name", "description", "copywrite", "brand", "formats", "native", "sizes", "assets", "stockimages"]
    const updates = Object.keys(req.body)
    const dr = await model.findById(req.params.id)

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