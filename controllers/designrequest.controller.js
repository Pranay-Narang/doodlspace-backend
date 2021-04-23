const { default: validator } = require('validator');
const CONFIG = require('../config/config');

const model = require('../models/designrequest.model')

const add = async (req, res) => {
    const dr = new model({
        cid: req.uid,
        ...req.body
    })

    try {
        await dr.save()
        await dr.populate('brand')
            .populate('designer')
            .execPopulate()
        res.status(201).send(dr)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    if (req.role == 'customer') {
        const dr = await model.find({ cid: req.uid })
        await dr.populate('brand')
            .populate('designer')
            .execPopoulate()

        return res.send(dr)
    }

    const globalDr = await model.find().populate('brand')
        .populate('designer')
    res.send(globalDr)
}

module.exports.read = read