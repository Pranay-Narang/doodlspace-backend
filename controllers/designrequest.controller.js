const validator = require('validator');
const CONFIG = require('../config/config');

const model = require('../models/designrequest.model')

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    var assets = []
    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }

    const dr = new model({
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

const readOne = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.findOne({
            cid: req.uid,
            _id: req.params.id
        })
            .populate('brand')
            .populate('designer')

        dr['assets'] = await preSigner(dr, 'assets')
        return res.send(dr)
    }

    const globalDr = await model.findOne({ _id: req.params.id })
        .populate('brand')
        .populate('designer')
    res.send(globalDr)
}

module.exports.readOne = readOne

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