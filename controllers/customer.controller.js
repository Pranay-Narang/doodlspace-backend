const admin = require('firebase-admin')

const model = require('../models/customer.model')
const brandModel = require('../models/brand.model')

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    const allowedFields = ["name", "email", "phone", "company", "address"]
    const values = Object.keys(req.body)

    const validOperation = values.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    const customer = new model({
        uid: req.uid,
        ...req.body
    })

    try {
        await admin.auth().setCustomUserClaims(req.uid, {
            role: 'customer'
        })

        await customer.save()
        res.status(201).send(customer)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    if (req.role == 'customer') {
        const customer = await model.find({ uid: req.uid }).populate('designers')
        return res.send(customer)
    }
    const customers = await model.find().populate('designers')
    res.send(customers)
}

module.exports.read = read

const update = async (req, res) => {
    var allowedFields = []
    req.role == 'owner' ? allowedFields = ["name", "email", "phone", "designers", "company", "address"] : allowedFields = ["name", "email", "phone", "company", "address"]
    const updates = Object.keys(req.body)
    const customer = await model.findOne({ uid: req.params.id })

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    try {
        updates.forEach((elem) => customer[elem] = req.body[elem])
        await customer.save()
        await customer.populate('designers').execPopulate()
        res.send(customer)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const remove = async (req, res) => {
    const customer = await model.findOne({ uid: req.params.id })
    try {
        await customer.remove()
        res.send(customer)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove

const readBrands = async (req, res) => {
    try {
        const brands = await brandModel.find({ cid: req.params.id })
        await Promise.all(brands.map(async elem => {
            elem['assets'] = await preSigner(elem, 'assets')
            elem['stockimages'] = await preSigner(elem, 'stockimages')
            elem['logo'] = await preSigner(elem, 'logo')
            elem['storedfonts'] = await preSigner(elem, 'storedfonts')
            return elem
        }))
        res.send(brands)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.readBrands = readBrands