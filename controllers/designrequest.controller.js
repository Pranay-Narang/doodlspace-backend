const validator = require('validator');
const CONFIG = require('../config/config');

const model = require('../models/designrequest.model')

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    var assets = []
    var stockimages = []
    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }
    if (req.files.stockimages) {
        stockimages = req.files.stockimages.map(image => image.key)
    }

    const dr = new model({
        cid: req.uid,
        ...req.body,
        assets,
        stockimages
    })

    try {
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        dr['assets'] = await preSigner(dr, 'assets')
        dr['stockimages'] = await preSigner(dr, 'stockimages')
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
        dr['stockimages'] = await preSigner(dr, 'stockimages')
        return res.send(dr)
    }

    const globalDr = await model.findOne({ _id: req.params.id })
        .populate('brand')
        .populate('designer')
    res.send(globalDr)
}

module.exports.readOne = readOne